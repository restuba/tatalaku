"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle } from "lucide-react";
import { Modal } from "@/components/reusable/modal";
import { Button } from "@/components/reusable/button";
import { Input } from "@/components/reusable/input";
import { useDialogStore, type DialogRequest } from "@/stores/dialog-store";

type ConfirmRequest = Extract<DialogRequest, { kind: "confirm" }>;
type PromptRequest = Extract<DialogRequest, { kind: "prompt" }>;

function ConfirmBody({
  request,
  onSettle,
}: {
  request: ConfirmRequest;
  onSettle: (ok: boolean) => void;
}) {
  const isDanger = request.tone === "danger";

  return (
    <>
      <Modal.Header showClose={false}>{request.title}</Modal.Header>
      {request.description && (
        <Modal.Content className="pt-1 leading-relaxed text-codex-muted">
          {request.description}
        </Modal.Content>
      )}
      <Modal.Action>
        {/* Destructive actions start on Cancel so Enter can't delete by accident */}
        <Button size="small" autoFocus={isDanger} onClick={() => onSettle(false)}>
          {request.cancelLabel ?? "Cancel"}
        </Button>
        <Button
          size="small"
          btnType="primary"
          color={isDanger ? "danger" : "primary"}
          autoFocus={!isDanger}
          onClick={() => onSettle(true)}
        >
          {request.confirmLabel ?? "Confirm"}
        </Button>
      </Modal.Action>
    </>
  );
}

function PromptBody({
  request,
  onSettle,
}: {
  request: PromptRequest;
  onSettle: (value: string | null) => void;
}) {
  const [value, setValue] = useState(request.defaultValue ?? "");
  const [error, setError] = useState<string | null>(null);
  const inputId = `dialog-prompt-${request.id}`;
  const errorId = `${inputId}-error`;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    const validationError = request.validate?.(trimmed) ?? null;
    if (validationError) {
      setError(validationError);
      return;
    }
    onSettle(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Modal.Header showClose={false}>{request.title}</Modal.Header>
      <Modal.Content className="space-y-2">
        {request.description && (
          <p className="leading-relaxed text-codex-muted">{request.description}</p>
        )}
        {request.label && (
          <label htmlFor={inputId} className="block pt-1 text-sm font-medium text-codex-foreground">
            {request.label}
          </label>
        )}
        <Input
          id={inputId}
          type={request.inputType ?? "text"}
          autoFocus
          value={value}
          placeholder={request.placeholder}
          status={error ? "error" : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(next) => {
            setValue(next);
            if (error) setError(null);
          }}
        />
        {error && (
          <p
            id={errorId}
            role="alert"
            className="flex items-start gap-1.5 text-sm text-codex-danger"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}
      </Modal.Content>
      <Modal.Action>
        <Button size="small" onClick={() => onSettle(null)}>
          {request.cancelLabel ?? "Cancel"}
        </Button>
        <Button size="small" btnType="primary" htmlType="submit">
          {request.confirmLabel ?? "OK"}
        </Button>
      </Modal.Action>
    </form>
  );
}

/** Renders the active confirm/prompt request. Mount once near the app root. */
export function DialogHost() {
  const request = useDialogStore((s) => s.request);
  const settle = useDialogStore((s) => s.settle);

  // Dismissing (Escape / backdrop) counts as cancel
  const dismiss = () => settle(request?.kind === "confirm" ? false : null);

  return (
    <Modal open={request !== null} onClose={dismiss} maxWidth="sm" elevated>
      {request?.kind === "confirm" && (
        <ConfirmBody key={request.id} request={request} onSettle={settle} />
      )}
      {request?.kind === "prompt" && (
        <PromptBody key={request.id} request={request} onSettle={settle} />
      )}
    </Modal>
  );
}

export default DialogHost;
