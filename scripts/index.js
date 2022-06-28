'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const fs_1 = __importDefault(require('fs'));
const main = () =>
  __awaiter(void 0, void 0, void 0, function* () {
    const folders = yield fs_1.default.readdirSync('./src/hooks');
    const hooks = folders.map((folder) => {
      const hook = folder
        .split('-')
        .map((text, index) =>
          index === 0 ? text : `${text[0].toUpperCase()}${text.slice(1)}`,
        )
        .join('');
      return { hook, folder };
    });
    console.log(hooks);
    const body = [];
    for (const { hook, folder } of hooks) {
      const header = `### ${hook}`;
      const content = yield fs_1.default.readFileSync(
        `./src/hooks/${folder}/index.ts`,
      );
      const section = `${header}

\`\`\`tsx
${content}\`\`\`
`;
      body.push(`${section}`);
    }
    const nativeHooks = [
      'useState',
      'useEffect',
      'useContext',
      'useReducer',
      'useCallback',
      'useMemo',
      'useRef',
      'useImperativeHandle',
      'useLayoutEffect',
      'useDebugValue',
    ];
    const markdown = `# (React) \`useHooks\`

- [Native](#native)
- [Hooks](#hooks)
${hooks
  .map(({ hook }) => {
    return `  - [${hook}](#${hook.toLowerCase()})`;
  })
  .join('\n')}
- [Reference](#reference)

## Native

${nativeHooks
  .map((hook) => {
    return `- [\`${hook}\`](https://reactjs.org/docs/hooks-reference.html#${hook.toString()})`;
  })
  .join('\n')}

## Hooks

${body.join('\n')}
## Reference

- [use-hooks](https://usehooks.com/)
- [use-hooks-ts](https://usehooks-ts.com/)
`;
    yield fs_1.default.writeFileSync('./README.md', markdown);
  });
main().catch((error) => console.error(error));
