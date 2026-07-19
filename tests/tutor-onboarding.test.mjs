import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

async function importTypeScript(path) {
  const source = await readFile(path, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
      verbatimModuleSyntax: false,
    },
  }).outputText;

  return import(`data:text/javascript;base64,${Buffer.from(output).toString("base64")}`);
}

const statusModule = await importTypeScript("src/lib/tutor-onboarding/status-transitions.ts");
const availabilityModule = await importTypeScript("src/lib/tutor-onboarding/availability.ts");
const accessModule = await importTypeScript("src/lib/tutor-onboarding/access-control.ts");
const msMessages = JSON.parse(await readFile("messages/ms.json", "utf8"));
const enMessages = JSON.parse(await readFile("messages/en.json", "utf8"));

test("invalid tutor application status transitions are rejected", () => {
  assert.equal(statusModule.canTransition("draft", "approved"), false);
  assert.throws(() =>
    statusModule.assertTransition({
      actorRole: "tutor",
      actorProfileId: "tutor-1",
      ownerProfileId: "tutor-1",
      from: "draft",
      to: "approved",
    }),
  );
});

test("tutor cannot access another tutor application", () => {
  assert.equal(
    accessModule.canReadTutorApplication({
      actorRole: "tutor",
      actorProfileId: "tutor-1",
      ownerProfileId: "tutor-2",
      status: "draft",
    }),
    false,
  );
});

test("tutor cannot approve themselves", () => {
  assert.equal(
    statusModule.canActorTransition({
      actorRole: "tutor",
      actorProfileId: "tutor-1",
      ownerProfileId: "tutor-1",
      from: "under_review",
      to: "approved",
    }),
    false,
  );
});

test("overlapping weekly availability is rejected", () => {
  const overlaps = availabilityModule.findOverlappingAvailability([
    { dayOfWeek: 1, startTime: "20:00", endTime: "21:30", active: true },
    { dayOfWeek: 1, startTime: "21:00", endTime: "22:00", active: true },
  ]);

  assert.deepEqual(overlaps, [[0, 1]]);
});

test("private document buckets are not public", () => {
  assert.equal(accessModule.canDocumentBePublic("tutor-identity-documents"), false);
  assert.equal(accessModule.canDocumentBePublic("tutor-qualification-documents"), false);
  assert.equal(accessModule.canDocumentBePublic("tutor-profile-images"), true);
});

test("tutor can save a draft and submit a complete application transition", () => {
  const draft = { status: "draft", completionPercent: 100 };

  assert.equal(draft.status, "draft");
  assert.equal(
    statusModule.canActorTransition({
      actorRole: "tutor",
      actorProfileId: "tutor-1",
      ownerProfileId: "tutor-1",
      from: "draft",
      to: "submitted",
    }),
    true,
  );
});

test("admin can request changes, tutor can resubmit, admin can approve", () => {
  assert.equal(
    statusModule.canActorTransition({
      actorRole: "admin",
      actorProfileId: "admin-1",
      ownerProfileId: "tutor-1",
      from: "under_review",
      to: "changes_requested",
    }),
    true,
  );
  assert.equal(
    statusModule.canActorTransition({
      actorRole: "tutor",
      actorProfileId: "tutor-1",
      ownerProfileId: "tutor-1",
      from: "changes_requested",
      to: "resubmitted",
    }),
    true,
  );
  assert.equal(
    statusModule.canActorTransition({
      actorRole: "admin",
      actorProfileId: "admin-1",
      ownerProfileId: "tutor-1",
      from: "under_review",
      to: "approved",
    }),
    true,
  );
});

test("approved tutor status label is reflected in both languages", () => {
  assert.equal(msMessages.status.approved, "Telah diluluskan");
  assert.equal(enMessages.status.approved, "Approved");
});

test("language switch keys exist on onboarding pages", () => {
  assert.equal(msMessages.onboarding.title.length > 0, true);
  assert.equal(enMessages.onboarding.title.length > 0, true);
  assert.equal(msMessages.nav.searchTutors.length > 0, true);
  assert.equal(enMessages.nav.searchTutors.length > 0, true);
});
