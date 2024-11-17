import clsx from "clsx";
import { ReactNode, useRef } from "react";

function ActionButton({
  onClick,
  children,
  className,
}: {
  children: ReactNode;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "rounded-[20px] box-content text-sm text-center outline-none border-none hover:bg-opacity-75",
        className
      )}
    >
      {children}
    </button>
  );
}

export default function EditMessageInput({
  content,
  onCancel,
  onSend,
}: {
  content: string;
  onCancel: () => any;
  onSend: (newContent: string) => any;
}) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="rounded-[26px] p-[16px] bg-gray-600 m-0 w-full flex flex-col justify-between items-center overflow-hidden min-h-[100px]">
      <textarea
        ref={textAreaRef}
        defaultValue={content}
        autoFocus
        rows={1}
        onKeyUp={(ev) => {
          if (ev.key === "Enter") {
            onSend(textAreaRef.current!.value);
          }
        }}
        className="bg-inherit text-start ml-[24px] text-white text-base outline-none w-full resize-none leading-tight text-wrap break-words overflow-auto max-h-[300px]"
      />
      <div className="self-end flex gap-2">
        <ActionButton onClick={onCancel} className="bg-slate-700 text-white">
          Cancel
        </ActionButton>
        <ActionButton
          onClick={() => {
            if (textAreaRef.current?.value.trim())
              onSend(textAreaRef.current.value);
          }}
          className="bg-white text-slate-700"
        >
          Send
        </ActionButton>
      </div>
    </div>
  );
}
