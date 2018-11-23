function fish_user_key_bindings
  for mode in insert default visual
    bind -M $mode \cf forward-char
    bind -M insert ii "if commandline -P; commandline -f cancel; else; set fish_bind_mode default; commandline -f backward-char force-repaint; end"
  end
end
