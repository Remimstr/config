# Defined in - @ line 0
function xra --description 'alias xra=xrandr --output HDMI1 --auto --above eDP1'
	xrandr --output HDMI1 --auto --above eDP1 $argv;
end
