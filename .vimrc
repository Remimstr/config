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
" Language-specific plugins
Plug 'godlygeek/tabular'
Plug 'plasticboy/vim-markdown'
Plug 'iamcco/markdown-preview.vim'
Plug 'elmcast/elm-vim'
Plug 'pangloss/vim-javascript'
Plug 'mxw/vim-jsx'
Plug 'leafgarland/typescript-vim'
Plug 'tmhedberg/matchit'
Plug 'udalov/kotlin-vim'
Plug 'mattn/emmet-vim'

call plug#end()

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
""" PLUGIN SETTINGS
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

" arcticicestudio/nord-vim
" Change the comment brightness in nord
let g:nord_comment_brightness=10

" Set the colorscheme
colorscheme nord

"" w0rp/ale
" Change some of the ale defaults
let g:ale_sign_error='●'
let g:ale_sign_warning='.'
let g:ale_lint_on_enter=0

" Fix files on save
let g:ale_fixers = {
  \ '*': ['remove_trailing_lines', 'trim_whitespace'],
  \ 'javascript': ['prettier', 'eslint'],
  \ 'typescript': ['prettier', 'eslint'],
  \ 'elm': ['elm-format', 'format'],
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

"" pangloss/vim-javascript
" Enable syntax highlighting for flow
let g:javascript_plugin_flow = 1

" Enables code folding based on syntax file
augroup javascript_folding
	au!
	au FileType javascript setlocal foldmethod=syntax
augroup END

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

set termguicolors

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
""" COLORSCHEME SETTINGS
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
hi Normal guibg=NONE ctermbg=NONE
highlight clear LineNr guifg=purple
