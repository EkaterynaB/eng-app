import { useNavigate } from "react-router-dom";
import { DialogueEditor } from "../components/DialogueEditor";
import { useDialogues } from "../hooks/useDialogues";
import { DialogueInput } from "../types/dialogue";

export function DialogueCreatePage() {
  const { createDialogue } = useDialogues();
  const navigate = useNavigate();

  const handleSubmit = async (input: DialogueInput) => {
    const created = await createDialogue(input);
    navigate(`/dialogues/${created._id}`);
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>New dialogue</h1>
      </header>
      <DialogueEditor onSubmit={handleSubmit} onCancel={() => navigate("/dialogues")} submitLabel="Create dialogue" />
    </div>
  );
}
