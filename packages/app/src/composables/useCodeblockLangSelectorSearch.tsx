import { NInput } from 'naive-ui'
import { langsMap } from '../utils/setupHighlightjs'

const langOptions = Object.keys(langsMap).map(langName => ({
  label: langName,
  key: langName,
}))
const langNameToLangIdAliasMap: Record<string, string> = {
  'javascript': 'js',
  'typescript': 'ts',
  'c++': 'cpp',
  'c#': 'csharp',
  'f#': 'fsharp',
}
const langIdToLangNameAliasMap = Object.fromEntries(
  Object
    .entries(langNameToLangIdAliasMap)
    .map(entry => entry.reverse()),
)

export function useCodeBlockLangSearchOptions() {
  const { t } = useI18n()
  const searchWord = ref('')
  const searchInputOption = [{
    key: 'searchInput',
    type: 'render',
    render: () => (
      <NInput
        class="hetero-editor__code-block-lang-search"
        placeholder={t('editor.menu.code-block-lang-search-placeholder')}
        value={searchWord.value}
        onInput={(inputValue) => {
          searchWord.value = inputValue
        }}
        v-slots={{
          icon: () => <div i-ic:sharp-manage-search />,
        }}
      />
    ),
  }, {
    type: 'divider',
    key: 'd1',
  }]

  const filteredOptions = computed(() => {
    if (searchWord.value === '') {
      return [
        ...searchInputOption,
        ...langOptions,
      ]
    }

    return [
      ...searchInputOption,
      ...langOptions.filter(
        option => option.label.includes(searchWord.value),
      ),
    ]
  })

  return {
    searchWord,
    filteredOptions,
    langNameToLangIdAliasMap,
    langIdToLangNameAliasMap,
  }
}
