# Defined in - @ line 0
function xraa
  xrandr --output VIRTUAL1 --off --output eDP1 --primary --mode 1920x1080 --pos 992x1080 --rotate normal --output DP1 --off --output HDMI2 --off --output HDMI1 --mode 1920x1080 --pos 0x0 --rotate normal --output DP2 --mode 1920x1080 --pos 1920x0 --rotate normal
  i3-msg restart
end
