import { ArrowUp02Icon } from "hugeicons-react";
import StopCircleIcon from "@mui/icons-material/StopCircle";

export default function InputBox({
  onSubmit,
  isGenerating = false,
  stopGenerating,
}: {
  onSubmit: (text: string) => any;
  isGenerating?: boolean;
  stopGenerating?: () => any;
}) {
  const onSubmitHandler = (ev) => {
    ev.preventDefault();
    const formData = new FormData(ev.currentTarget);

    ev.currentTarget.reset();

    const text = (formData.get("text") as string) || "";

    if (!text) {
      return;
    }

    onSubmit(text);
  };

  return (
    <form
      className="contents"
      onSubmit={onSubmitHandler}
      onKeyDown={(ev) => {
        if (ev.key === "Enter") {
          onSubmitHandler(ev);
        }
      }}
    >
      <div className="rounded-[26px] p-2 bg-gray-600 m-0 w-full flex flex-row justify-start items-center overflow-auto h-fit">
        <textarea
          name="text"
          placeholder="Message VisorGPT"
          autoFocus
          rows={1}
          onChange={(ev) => {
            ev.currentTarget.style.height = ev.currentTarget.style.minHeight =
              "auto";
            ev.currentTarget.style.height =
              ev.currentTarget.scrollHeight + "px";
          }}
          className="bg-inherit text-start ml-[24px] text-white text-base outline-none w-[80%] placeholder:text-gray-400 resize-none leading-tight text-wrap break-words overflow-auto max-h-[140px]"
        />
        {!isGenerating ? (
          <button type={"submit"} className="contents">
            <ArrowUp02Icon className="w-[32px] h-[32px] rounded-full bg-gray-700 p-[4px] ml-auto cursor-pointer" />
          </button>
        ) : (
          <button className="contents" onClick={stopGenerating}>
            <StopCircleIcon className="w-[32px] h-[32px] rounded-full ml-auto cursor-pointer" />
          </button>
        )}
      </div>
    </form>
  );
}
