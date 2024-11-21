export default {
  names: ["add-spaces"],
  description: "Add two spaces at the end of each line",
  tags: ["spaces"],
  function: function rule(params, onError) {
    params.lines.forEach((line, lineIndex) => {
      if (line.trim() && !line.endsWith("  ")) {
        onError({
          lineNumber: lineIndex + 1,
          detail: "Line should end with two spaces",
          fixInfo: {
            editColumn: line.length + 1,
            insertText: "  ",
          },
        });
      }
    });
  },
};
