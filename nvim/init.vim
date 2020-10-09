let mapleader=","

""" B_VIMPLUG

call plug#begin('~/.vim/plugged')

Plug 'neoclide/coc.nvim', { 'branch': 'release' }
Plug 'peitalin/vim-jsx-typescript'
Plug 'scrooloose/nerdtree'
Plug 'Xuyuanp/nerdtree-git-plugin'
Plug 'ryanoasis/vim-devicons'
Plug 'ctrlpvim/ctrlp.vim'
" Plug 'itchyny/lightline.vim'
Plug 'vim-airline/vim-airline'
Plug 'vim-airline/vim-airline-themes'
Plug 'christoomey/vim-tmux-navigator'
Plug 'airblade/vim-gitgutter'
Plug 'jeetsukumaran/vim-buffergator'
Plug 'tpope/vim-commentary'
Plug 'tpope/vim-fugitive'
Plug 'jeffkreeftmeijer/vim-numbertoggle'
Plug 'arcticicestudio/nord-vim'

call plug#end()

" Copy/Paste with the standard keys
vmap <C-c> "+yi
vmap <C-x> "+c
vmap <C-v> c<ESC>"+p
imap <C-v> <C-r><C-o>+

""" E_VIMPLUG

set shell=sh

""" B_NERDTREE

" open NERDTree automatically
autocmd StdinReadPre * let s:std_in=1
autocmd VimEnter * NERDTree

" Toggle nerdtree
nmap <C-n> :NERDTreeToggle<CR>

" Exit nerdtree if it's the last buffer
autocmd bufenter * if (winnr("$") == 1 && exists("b:NERDTree") && b:NERDTree.isTabTree()) | q | endif

let g:NERDTreeIgnore = ['^node_modules$']

" " sync open file with NERDTree
" " " Check if NERDTree is open or active
" function! IsNERDTreeOpen()        
"   return exists("t:NERDTreeBufName") && (bufwinnr(t:NERDTreeBufName) != -1)
" endfunction

" " Call NERDTreeFind iff NERDTree is active, current window contains a modifiable
" " file, and we're not in vimdiff
" function! SyncTree()
"   if &modifiable && IsNERDTreeOpen() && strlen(expand('%')) > 0 && !&diff
"     NERDTreeFind
"     wincmd p
"   endif
" endfunction

" " Highlight currently open buffer in NERDTree
" autocmd BufEnter * call SyncTree()

""" E_NERDTREE

""" B_CTRLP

" Ignore all files in gitignore
let g:ctrlp_user_command = ['.git/', 'git --git-dir=%s/.git ls-files -oc --exclude-standard']

""" B_NORD

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

""" E_NORD

""" B_BUFFERGATOR

" jeetsukumaran/vim-buffergator

" Use the right side of the screen
let g:buffergator_viewport_split_policy = 'R'

" Loop buffers
let g:buffergator_mru_cycle_loop = 1

""" E_BUFFERGATOR

""" B_DEVICONS

" Use double-width glyphs
let g:WebDevIconsUnicodeGlyphDoubleWidth = 1

""" E_DEVICONS

""" B_AIRLINE

let g:airline_theme='nord'

""" E_AIRLINE

""" B_COC

" Use `[g` and `]g` to navigate diagnostics
nmap <silent> [g <Plug>(coc-diagnostic-prev)
nmap <silent> ]g <Plug>(coc-diagnostic-next)

" GoTo code navigation.
nmap <silent> gd <Plug>(coc-definition)
nmap <silent> gy <Plug>(coc-type-definition)
nmap <silent> gi <Plug>(coc-implementation)
nmap <silent> gr <Plug>(coc-references)

""" E_COC

""" B_MISC

set number relativenumber

nmap <silent> ,/ :nohlsearch<CR>

augroup numbertoggle
	autocmd!
	autocmd BufEnter,FocusGained,InsertLeave * set relativenumber
	autocmd BufLeave,FocusLost,InsertEnter   * set norelativenumber
augroup END

" A tab is 2 spaces
set tabstop=2

" Set autoindent always on
set autoindent

" Always set autoindent on
set autoindent

" Copy the previous indentation on autoindenting
set copyindent

" The number of spaces to use while autoindenting
set shiftwidth=2

" Set show matching parenthesis
set showmatch

" Highlight search terms
set hlsearch

" Show search matches as you type
set incsearch

" Indent according to the syntax rules for the file type
filetype plugin indent on

" Quickly edit/reload the vimrc file
nmap <silent> <leader>ev :e $MYVIMRC<CR>
nmap <silent> <leader>sv :so $MYVIMRC<CR>

" Get rid of the pesky newline comments
autocmd BufNewFile,BufRead * setlocal formatoptions-=cro

set updatetime=100

" Copy/Paste with the standard keys
vmap <C-c> "+yi
vmap <C-x> "+c
vmap <C-v> c<ESC>"+p
imap <C-v> <C-r><C-o>+

""" E_MISC
