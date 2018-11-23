"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
""" MISC 
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

" This must be set first, because it changes other options as side
" effect
set nocompatible

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
""" VIM-PLUG
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
call plug#begin()

Plug 'arcticicestudio/nord-vim'
Plug 'w0rp/ale'
Plug 'scrooloose/nerdtree'
Plug 'itchyny/lightline.vim'
Plug 'airblade/vim-gitgutter'
Plug 'ctrlpvim/ctrlp.vim'
" Language-specific plugins
Plug 'elmcast/elm-vim'
Plug 'pangloss/vim-javascript'
Plug 'mxw/vim-jsx'

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
let b:ale_fixers = ['prettier', 'eslint']
let g:ale_fix_on_save=1

" Enable completion where available
" let g:ale_completion_enabled = 1

"" scrooloose/nerdtree
" Open automatically
autocmd vimenter * NERDTree

" Exit nerdtree if it's the last buffer
autocmd bufenter * if (winnr("$") == 1 && exists("b:NERDTree") && b:NERDTree.isTabTree()) | q | endif

""" itchyny/lightline.vim
" Set the colorscheme
let g:lightline = {
  \ 'colorscheme': 'nord',
  \ }

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

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
""" KEY SETTINGS
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

" Quickly edit/reload the vimrc file
nmap <silent> <leader>ev :e $MYVIMRC<CR>
nmap <silent> <leader>sv :so $MYVIMRC<CR>

" Stop using the arrow keys!
map <up> <nop>
map <down> <nop>
map <left> <nop>
map <right> <nop>

" Change ; to :
nnoremap ; :

" Change the mapleader from \ to ,
let mapleader=","

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
set shiftwidth=4

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

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
""" REMAP THE ESCAPE KEY
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
imap ii <Esc>

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

