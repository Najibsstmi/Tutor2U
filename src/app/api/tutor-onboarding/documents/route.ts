import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  buildTutorDocumentPath,
  getBucketForDocumentScope,
  validateTutorDocument,
  type TutorDocumentScope,
} from "@/lib/tutor-onboarding/storage";

const documentScopes: TutorDocumentScope[] = ["identity_front", "identity_back", "qualification", "profile_photo"];

function isDocumentScope(value: unknown): value is TutorDocumentScope {
  return typeof value === "string" && documentScopes.includes(value as TutorDocumentScope);
}

export async function POST(request: Request) {
  try {
    const context = await requireRole("tutor");
    const supabase = await getSupabaseServerClient();

    if (!supabase) {
      return NextResponse.json({ message: "Supabase belum dikonfigurasi." }, { status: 503 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const applicationId = String(formData.get("applicationId") ?? "");
    const scope = formData.get("scope");

    if (!(file instanceof File) || !applicationId || !isDocumentScope(scope)) {
      return NextResponse.json({ message: "Payload upload tidak sah." }, { status: 400 });
    }

    const validation = validateTutorDocument({ name: file.name, type: file.type, size: file.size });

    if (!validation.ok) {
      return NextResponse.json({ message: validation.message }, { status: 400 });
    }

    const { data: tutorProfile, error: tutorError } = await supabase
      .from("tutor_profiles")
      .select("id")
      .eq("profile_id", context.profile.id)
      .single();

    if (tutorError || !tutorProfile?.id) {
      return NextResponse.json({ message: "Profil tutor tidak ditemui." }, { status: 404 });
    }

    const { data: application, error: applicationError } = await supabase
      .from("tutor_applications")
      .select("id")
      .eq("id", applicationId)
      .eq("tutor_profile_id", tutorProfile.id)
      .single();

    if (applicationError || !application?.id) {
      return NextResponse.json({ message: "Permohonan tutor tidak ditemui." }, { status: 404 });
    }

    const bucketId = getBucketForDocumentScope(scope);
    const path = buildTutorDocumentPath({
      profileId: context.profile.id,
      applicationId,
      scope,
      fileName: file.name,
    });

    const { error: uploadError } = await supabase.storage.from(bucketId).upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

    if (uploadError) {
      return NextResponse.json({ message: uploadError.message }, { status: 500 });
    }

    const { data: document, error: documentError } = await supabase
      .from("tutor_documents")
      .insert({
        tutor_profile_id: tutorProfile.id,
        application_id: applicationId,
        document_type: scope,
        document_scope: scope,
        bucket_id: bucketId,
        file_path: path,
        mime_type: file.type,
        file_size_bytes: file.size,
        private: bucketId !== "tutor-profile-images",
        status: "submitted",
      })
      .select("id")
      .single();

    if (documentError) {
      await supabase.storage.from(bucketId).remove([path]);
      return NextResponse.json({ message: documentError.message }, { status: 500 });
    }

    const publicUrl = bucketId === "tutor-profile-images"
      ? supabase.storage.from(bucketId).getPublicUrl(path).data.publicUrl
      : null;

    if (publicUrl) {
      const { error: profilePhotoError } = await supabase
        .from("tutor_profiles")
        .update({ profile_photo_url: publicUrl })
        .eq("id", tutorProfile.id);

      if (profilePhotoError) {
        return NextResponse.json({ message: profilePhotoError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ documentId: document.id, bucketId, path, publicUrl });
  } catch (error) {
    const status = error instanceof Error && error.message.includes("permission") ? 403 : 401;
    return NextResponse.json({ message: error instanceof Error ? error.message : "Upload gagal." }, { status });
  }
}
