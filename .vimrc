"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
""" MISC
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

" This must be set first, because it changes other options as side
" effect
set nocompatible

" Map the leader key to something that makes more sense
let mapleader=","

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
""" VIM-PLUG
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
call plug#begin()

Plug 'neoclide/coc.nvim', {'branch': 'release'}
Plug 'arcticicestudio/nord-vim'
Plug 'w0rp/ale'
Plug 'scrooloose/nerdtree'
Plug 'itchyny/lightline.vim'
Plug 'Yggdroot/indentLine'
Plug 'airblade/vim-gitgutter'
Plug 'ctrlpvim/ctrlp.vim'
Plug 'tpope/vim-surround'
Plug 'tpope/vim-fugitive'
Plug 'tpope/vim-repeat'
Plug 'tpope/vim-unimpaired'
Plug 'tpope/vim-commentary'
Plug 'takac/vim-hardtime'
Plug 'christoomey/vim-tmux-navigator'
Plug 'benmills/vimux'
Plug 'wincent/terminus'
Plug 'rafaqz/ranger.vim'
Plug 'lervag/vimtex'
Plug 'junegunn/fzf.vim'
Plug 'ajh17/VimCompletesMe'
Plug 'majutsushi/tagbar'
" Plug 'ludovicchabant/vim-gutentags'
Plug 'kristijanhusak/vim-js-file-import', { 'do': 'npm install' }
Plug 'jeetsukumaran/vim-buffergator'
" Language-specific plugins
Plug 'godlygeek/tabular'
Plug 'plasticboy/vim-markdown'
Plug 'iamcco/markdown-preview.vim'
Plug 'elmcast/elm-vim'
Plug 'pangloss/vim-javascript'
Plug 'mxw/vim-jsx'
Plug 'leafgarland/typescript-vim'
Plug 'peitalin/vim-jsx-typescript'
Plug 'Quramy/tsuquyomi'
Plug 'tmhedberg/matchit'
Plug 'udalov/kotlin-vim'
Plug 'mattn/emmet-vim'
Plug 'rust-lang/rust.vim'
Plug 'posva/vim-vue'

call plug#end()

" TextEdit might fail if hidden is not set.
set hidden

" Some servers have issues with backup files, see #649.
set nobackup
set nowritebackup

" Give more space for displaying messages.
set cmdheight=2

" Having longer updatetime (default is 4000 ms = 4 s) leads to noticeable
" delays and poor user experience.
set updatetime=300

" Don't pass messages to |ins-completion-menu|.
set shortmess+=c

" Always show the signcolumn, otherwise it would shift the text each time
" diagnostics appear/become resolved.
set signcolumn=yes

" Use tab for trigger completion with characters ahead and navigate.
" NOTE: Use command ':verbose imap <tab>' to make sure tab is not mapped by
" other plugin before putting this into your config.
inoremap <silent><expr> <TAB>
      \ pumvisible() ? "\<C-n>" :
      \ <SID>check_back_space() ? "\<TAB>" :
      \ coc#refresh()
inoremap <expr><S-TAB> pumvisible() ? "\<C-p>" : "\<C-h>"

function! s:check_back_space() abort
  let col = col('.') - 1
  return !col || getline('.')[col - 1]  =~# '\s'
endfunction

" Use <c-space> to trigger completion.
inoremap <silent><expr> <c-space> coc#refresh()

" Use <cr> to confirm completion, `<C-g>u` means break undo chain at current
" position. Coc only does snippet and additional edit on confirm.
if exists('*complete_info')
  inoremap <expr> <cr> complete_info()["selected"] != "-1" ? "\<C-y>" : "\<C-g>u\<CR>"
else
  imap <expr> <cr> pumvisible() ? "\<C-y>" : "\<C-g>u\<CR>"
endif

" Use `[g` and `]g` to navigate diagnostics
nmap <silent> [g <Plug>(coc-diagnostic-prev)
nmap <silent> ]g <Plug>(coc-diagnostic-next)

" GoTo code navigation.
nmap <silent> gd <Plug>(coc-definition)
nmap <silent> gy <Plug>(coc-type-definition)
nmap <silent> gi <Plug>(coc-implementation)
nmap <silent> gr <Plug>(coc-references)

" Use K to show documentation in preview window.
nnoremap <silent> K :call <SID>show_documentation()<CR>

function! s:show_documentation()
  if (index(['vim','help'], &filetype) >= 0)
    execute 'h '.expand('<cword>')
  else
    call CocAction('doHover')
  endif
endfunction

" Highlight the symbol and its references when holding the cursor.
autocmd CursorHold * silent call CocActionAsync('highlight')

" Symbol renaming.
nmap <leader>rn <Plug>(coc-rename)

" Formatting selected code.
xmap <leader>f  <Plug>(coc-format-selected)
nmap <leader>f  <Plug>(coc-format-selected)

augroup mygroup
  autocmd!
  " Setup formatexpr specified filetype(s).
  autocmd FileType typescript,json setl formatexpr=CocAction('formatSelected')
  " Update signature help on jump placeholder.
  autocmd User CocJumpPlaceholder call CocActionAsync('showSignatureHelp')
augroup end

" Applying codeAction to the selected region.
" Example: `<leader>aap` for current paragraph
xmap <leader>a  <Plug>(coc-codeaction-selected)
nmap <leader>a  <Plug>(coc-codeaction-selected)

" Remap keys for applying codeAction to the current line.
nmap <leader>ac  <Plug>(coc-codeaction)
" Apply AutoFix to problem on the current line.
nmap <leader>qf  <Plug>(coc-fix-current)

" Introduce function text object
" NOTE: Requires 'textDocument.documentSymbol' support from the language server.
xmap if <Plug>(coc-funcobj-i)
xmap af <Plug>(coc-funcobj-a)
omap if <Plug>(coc-funcobj-i)
omap af <Plug>(coc-funcobj-a)

" Use <TAB> for selections ranges.
" NOTE: Requires 'textDocument/selectionRange' support from the language server.
" coc-tsserver, coc-python are the examples of servers that support it.
nmap <silent> <TAB> <Plug>(coc-range-select)
xmap <silent> <TAB> <Plug>(coc-range-select)

" Add `:Format` command to format current buffer.
command! -nargs=0 Format :call CocAction('format')

" Add `:Fold` command to fold current buffer.
command! -nargs=? Fold :call     CocAction('fold', <f-args>)

" Add `:OR` command for organize imports of the current buffer.
command! -nargs=0 OR   :call     CocAction('runCommand', 'editor.action.organizeImport')

" Add (Neo)Vim's native statusline support.
" NOTE: Please see `:h coc-status` for integrations with external plugins that
" provide custom statusline: lightline.vim, vim-airline.
set statusline^=%{coc#status()}%{get(b:,'coc_current_function','')}

" Mappings using CoCList:
" Show all diagnostics.
nnoremap <silent> <space>a  :<C-u>CocList diagnostics<cr>
" Manage extensions.
nnoremap <silent> <space>e  :<C-u>CocList extensions<cr>
	return <div/>
" Show commands.
nnoremap <silent> <space>c  :<C-u>CocList commands<cr>
" Find symbol of current document.
nnoremap <silent> <space>o  :<C-u>CocList outline<cr>
" Search workspace symbols.
nnoremap <silent> <space>s  :<C-u>CocList -I symbols<cr>
" Do default action for next item.
nnoremap <silent> <space>j  :<C-u>CocNext<CR>
" Do default action for previous item.
nnoremap <silent> <space>k  :<C-u>CocPrev<CR>
" Resume latest coc list.
nnoremap <silent> <space>p  :<C-u>CocListResume<CR>

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
""" PLUGIN SETTINGS
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

" Make comments and other things readable
augroup nord-overrides
  autocmd!
  autocmd ColorScheme nord highlight Folded cterm=italic,bold ctermbg=0 ctermfg=12 guibg=#3B4252 guifg=#81A1C1
  autocmd ColorScheme nord highlight Comment ctermfg=12 guifg=#81A1C1
  autocmd ColorScheme nord highlight Search ctermbg=3 ctermfg=0 guibg=#EBCB8B guifg=#3B4252
  autocmd ColorScheme nord highlight IncSearch ctermbg=8 guibg=#4C566A
augroup END

" Set the colorscheme
colorscheme nord

"" peitalin/vim-jsx-typescript
" set filetypes as typescript.tsx
autocmd BufNewFile,BufRead *.tsx,*.jsx set filetype=typescript.tsx

"" Quramy/tsuquoyomi
" Show method's signature in popup menu
let g:tsuquyomi_completion_detail = 1

"" w0rp/ale
" Fix files on save

let g:ale_python_flake8_executable = 'python3'

let g:ale_fixers = {
  \ '*': ['remove_trailing_lines', 'trim_whitespace'],
  \ 'javascript': ['prettier', 'eslint'],
	\ 'typescript': ['prettier', 'eslint'],
	\ 'vue': ['prettier', 'eslint'],
  \ 'elm': ['elm-format', 'format'],
	\ 'python': ['autopep8', 'yapf'],
  \ }
let g:ale_fix_on_save=1

" Keybinds to jump around ale errors
nmap <silent> <leader>an :ALENext<cr>
nmap <silent> <leader>aN :ALEPrevious<cr>

" Enable completion where available
" let g:ale_completion_enabled = 1

"" scrooloose/nerdtree
" Toggle Nerdtree
map <leader>nt :NERDTreeToggle<CR>

" Exit nerdtree if it's the last buffer
autocmd bufenter * if (winnr("$") == 1 && exists("b:NERDTree") && b:NERDTree.isTabTree()) | q | endif

""" itchyny/lightline.vim
" Set the colorscheme
let g:lightline = {
  \ 'colorscheme': 'nord',
  \ }

""" Yggdroot/indentLine
" Enable leading spaces
let g:indentLine_leadingSpaceEnabled=1

" Having conceallevel set removes json quotes
let g:indentLine_conceallevel = 0

""" takac/vim-hardtime
" Activate Hardtime
let g:hardtime_default_on = 1

" Set the maximum number of repetative key presses
let g:hardtime_maxcount = 5
let g:list_of_normal_keys = ["h", "j", "k", "l", "-", "+"]

" Allow for different keys
let g:hardtime_allow_different_key = 1

""" benmills/vimux
" Prompt for a command to run
map <leader>vp :VimuxPromptCommand<CR>

""" rafaqz/ranger.vim
map <leader>rr :RangerEdit<cr>
map <leader>rv :RangerVSplit<cr>
map <leader>rs :RangerSplit<cr>
map <leader>rt :RangerTab<cr>
map <leader>ri :RangerInsert<cr>
map <leader>ra :RangerAppend<cr>
map <leader>rc :set operatorfunc=RangerChangeOperator<cr>g@
map <leader>rd :RangerCD<cr>
map <leader>rld :RangerLCD<cr>

"" elmcast/elm-vim
" Allow format on save
let g:elm_format_autosave = 0


"" rust-lang/rust.vim
" Allow format on save
let g:rustfmt_autosave = 1

"" pangloss/vim-javascript
" Enable syntax highlighting for flow
let g:javascript_plugin_flow = 1

"" Enables code folding based on syntax file
augroup javascript_folding
	au!
	au FileType javascript setlocal foldmethod=manual
augroup END

"" Prevents weird markdown behaviour
let g:vim_markdown_folding_style_pythonic = 1

" kien/ctrlp.vim
let g:ctrlp_custom_ignore = {
	\ 'dir': '\v[\/](\.(git|node_modules)|\_site)$',
	\ 'file': '\v\.(png|jpg|jpeg)$',
\}

" Use the nearest .git directory as the cwd
let g:ctrlp_wrking_path_node = 'r'

" Use a leader instead of the actual named binding
nmap <leader>p :CtrlP<cr>

" Easy bindings for various modes
nmap <leader>bb :CtrlPBuffer<cr>
nmap <leader>bm :CtrlPMixed<cr>
nmap <leader>bs :CtrlPPMRU<cr>

" jeetsukumaran/vim-buffergator

" Use the right side of the screen
let g:buffergator_viewport_split_policy = 'R'

" Loop buffers
let g:buffergator_mru_cycle_loop = 1

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
""" BEHAVIOURAL SETTINGS
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

" Allow saving of files as sudo when I foget to start vim using sudo.
cmap w!! w !sudo tee % > /dev/null

" Hide buffers instead of closing them
set hidden

" Remember more commands and search history
set history=1000

" Use many many levels of undo
set undolevels=1000

set clipboard=unnamed

" Set the fold level upon opening a file so that bits are unfolded
set foldlevelstart=4

set mouse=a

" Change the working directory to the file being edited
set autochdir

" Start a vim clientserver
if empty(v:servername) && exists('*remote_startserver')
  cal remote_startserver('VIM')
endif

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
""" KEY SETTINGS
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

" Quickly edit/reload the vimrc file
nmap <silent> <leader>ev :e $MYVIMRC<CR>
nmap <silent> <leader>sv :so $MYVIMRC<CR>

" Jump to the next row in the editor on wrapped text
nnoremap j gj
nnoremap k gk

" Easy window navigation :)
map <C-h> <C-w>h
map <C-j> <C-w>j
map <C-k> <C-w>k
map <C-l> <C-w>l

" Clear highlighted searches
nmap <silent> ,/ :nohlsearch<CR>

" Copy/Paste with the standard keys
vmap <C-c> "+yi
vmap <C-x> "+c
vmap <C-v> c<ESC>"+p
imap <C-v> <C-r><C-o>+

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
""" EDITOR SETTINGS
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

" Don't wrap lines
set nowrap

" A tab is 2 spaces
set tabstop=2

" Allow backspacing over everything in insert mode
set backspace=indent,eol,start

" Highlight syntax because life needs colour
syntax on

" Always set autoindent on
set autoindent

" Copy the previous indentation on autoindenting
set copyindent

" The number of spaces to use while autoindenting
set shiftwidth=2

" Set show matching parenthesis
set showmatch

" Always show line numbers
set number

" Insert tabs on the start of a line according to shiftwidth,
" not tabstop
set smarttab

" Highlight search terms
set hlsearch

" Show search matches as you type
set incsearch

" Set hybrid line numbers for easier navigation in normal mode
" Leave absolute numbers in insert mode
set number relativenumber

augroup numbertoggle
	autocmd!
	autocmd BufEnter,FocusGained,InsertLeave * set relativenumber
	autocmd BufLeave,FocusLost,InsertEnter   * set norelativenumber
augroup END

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
""" FILE TYPE SETTINGS
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

" Indent according to the syntax rules for the file type
filetype plugin indent on

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
""" MISC SETTINGS
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
""" COLORSCHEME SETTINGS
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
hi Normal guibg=NONE ctermbg=NONE
highlight clear LineNr guifg=purple
