# Defined in - @ line 0
function xrraa
  xrandr --output eDP1 --primary --mode 1920x1080 --pos 1920x1080 --rotate normal --output DP1 --off --output DP2 --mode 1920x1080 --pos 1920x0 --rotate normal --output HDMI1 --mode 1920x1080 --pos 0x0 --rotate normal --output HDMI2 --off --output VIRTUAL1 --off
  i3-msg restart
end
