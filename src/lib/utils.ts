import { createCn } from "cn/config";

// Teach the class merger the site's own tokens (see @theme in globals.css),
// so a size such as `text-small` is a font size and never mistaken for a
// colour that overrides `text-ink`.
export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "micro",
            "caption",
            "small",
            "body-sm",
            "body",
            "body-lg",
            "lead",
            "title-sm",
            "title",
            "heading-sm",
            "heading",
            "heading-lg",
          ],
        },
      ],
      rounded: [{ rounded: ["tile", "card-sm", "card", "panel"] }],
      "rounded-t": [{ "rounded-t": ["tile", "card-sm", "card", "panel"] }],
      "rounded-l": [{ "rounded-l": ["tile", "card-sm", "card", "panel"] }],
    },
  },
});
