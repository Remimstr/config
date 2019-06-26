# Defined in - @ line 0
function xroo --description 'alias xro=xrandr --output HDMI1 --off'
	xrandr --output HDMI1 --off --output DP2 --off $argv;
	i3-msg restart
end
