export const jsonData = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: {
        level: 1,
        anchorId: 'yAegjg',
      },
      content: [
        {
          type: 'text',
          text: 'Hello! Heterodoc',
        },
      ],
    },
    {
      type: 'paragraph',
      attrs: {
        textAlign: 'left',
        textIndent: 0,
      },
      content: [
        {
          type: 'text',
          text: 'This is a demo site for Heterodoc, you can try editing something here!',
        },
      ],
    },
    {
      type: 'paragraph',
      attrs: {
        textAlign: 'left',
        textIndent: 0,
      },
      content: [
        {
          type: 'text',
          text: 'Type ',
        },
        {
          type: 'text',
          marks: [
            {
              type: 'code',
            },
          ],
          text: '/',
        },
        {
          type: 'text',
          text: ' to trigger the menu, select blocks that match your need!',
        },
      ],
    },
    {
      type: 'paragraph',
      attrs: {
        textAlign: 'left',
        textIndent: 0,
      },
      content: [
        {
          type: 'text',
          marks: [
            {
              type: 'italic',
            },
            {
              type: 'fontFancy',
              attrs: {
                colorIndex: 5,
                bgColorIndex: 0,
              },
            },
          ],
          text: '© ShenQingchuan',
        },
      ],
    },
    {
      type: 'codeBlock',
      attrs: {
        params: 'c',
        alias: '',
      },
      content: [
        {
          type: 'text',
          text: '#include "stdio.h"\nint main() {\n  printf("Hello world\\n");\n}',
        },
      ],
    },
  ],
}
