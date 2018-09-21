" Allow saving of files as sudo when I foget to start vim using sudo.
cmap w!! w !sudo tee > /dev/null %
