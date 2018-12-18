#!/usr/bin/bash

THRESHOLD=10 # percent

lock_path='/tmp/battery-monitor.lock'

# The script will exit if already running
lockfile -r 0 $lock_path 2>/dev/null || exit

acpi_path=$(find /sys/class/power_supply/ -name 'BAT*'| head -1)
charge_now=$(cat "$acpi_path/charge_now")
charge_full=$(cat "$acpi_path/charge_full")
charge_status=$(cat "$acpi_path/status")
charge_percent=$(printf '%0.f' $(echo "$charge_now / $charge_full * 100" | bc -l))
message="Battery at $charge_percent%!"

if [[ $charge_status == "Discharging" ]] && [[ $charge_percent -le $THRESHOLD ]]; then
	DISPLAY=:00 /usr/bin/notify-send -u critical "Low battery" "$message"
fi

rm -f $lock_path
