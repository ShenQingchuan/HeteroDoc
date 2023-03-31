import hljs from 'highlight.js'
import apache from 'highlight.js/lib/languages/apache'
import arduino from 'highlight.js/lib/languages/arduino'
import bash from 'highlight.js/lib/languages/bash'
import basic from 'highlight.js/lib/languages/basic'
import bnf from 'highlight.js/lib/languages/bnf'
import c from 'highlight.js/lib/languages/c'
import clojure from 'highlight.js/lib/languages/clojure'
import cmake from 'highlight.js/lib/languages/cmake'
import coffeescript from 'highlight.js/lib/languages/coffeescript'
import cpp from 'highlight.js/lib/languages/cpp'
import crystal from 'highlight.js/lib/languages/crystal'
import csharp from 'highlight.js/lib/languages/csharp'
import diff from 'highlight.js/lib/languages/diff'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import elixir from 'highlight.js/lib/languages/elixir'
import erlang from 'highlight.js/lib/languages/erlang'
import fsharp from 'highlight.js/lib/languages/fsharp'
import go from 'highlight.js/lib/languages/go'
import lisp from 'highlight.js/lib/languages/lisp'
import haskell from 'highlight.js/lib/languages/haskell'
import ini from 'highlight.js/lib/languages/ini'
import java from 'highlight.js/lib/languages/java'
import julia from 'highlight.js/lib/languages/julia'
import json from 'highlight.js/lib/languages/json'
import kotlin from 'highlight.js/lib/languages/kotlin'
import lua from 'highlight.js/lib/languages/lua'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import markdown from 'highlight.js/lib/languages/markdown'
import nginx from 'highlight.js/lib/languages/nginx'
import objectivec from 'highlight.js/lib/languages/objectivec'
import powershell from 'highlight.js/lib/languages/powershell'
import protobuf from 'highlight.js/lib/languages/protobuf'
import python from 'highlight.js/lib/languages/python'
import reasonml from 'highlight.js/lib/languages/reasonml'
import r from 'highlight.js/lib/languages/r'
import rust from 'highlight.js/lib/languages/rust'
import ruby from 'highlight.js/lib/languages/ruby'
import scala from 'highlight.js/lib/languages/scala'
import scss from 'highlight.js/lib/languages/scss'
import sql from 'highlight.js/lib/languages/sql'
import stylus from 'highlight.js/lib/languages/stylus'
import thrift from 'highlight.js/lib/languages/thrift'
import vbscript from 'highlight.js/lib/languages/vbscript'
import vim from 'highlight.js/lib/languages/vim'
import wasm from 'highlight.js/lib/languages/wasm'
import yaml from 'highlight.js/lib/languages/yaml'
import plaintext from 'highlight.js/lib/languages/plaintext'
import type { LanguageFn } from 'highlight.js'

export const langsMap: Record<string, LanguageFn> = {
  apache,
  arduino,
  bash,
  basic,
  bnf,
  c,
  clojure,
  cmake,
  coffeescript,
  'c++': cpp,
  crystal,
  'c#': csharp,
  diff,
  dockerfile,
  elixir,
  erlang,
  'f#': fsharp,
  go,
  lisp,
  haskell,
  ini,
  java,
  julia,
  json,
  kotlin,
  lua,
  javascript: js,
  typescript: ts,
  markdown,
  nginx,
  objectivec,
  powershell,
  protobuf,
  python,
  plaintext,
  reasonml,
  r,
  rust,
  ruby,
  scala,
  scss,
  sql,
  stylus,
  thrift,
  vbscript,
  vim,
  WASM: wasm,
  yaml,
}

export const setupHightlightJS = () => {
  Object.entries(langsMap).forEach(([langName, langSpec]) => {
    hljs.registerLanguage(langName, langSpec)
  })
  return hljs
}
