const defaultTitle = "Visor GPT";

export default function useDocumentTitle(title?: string) {
  if (title) {
    document.title = title;
  } else {
    document.title = defaultTitle;
  }

  return () => {
    document.title = defaultTitle;
  };
}
