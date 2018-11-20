"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
""" MISC 
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

" This must be set first, because it changes other options as side
" effect
set nocompatible

" Pathogen is used to install and manage plugins
execute pathogen#infect()

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

" A tab is 4 spaces
set tabstop=4	

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

colorscheme torte
