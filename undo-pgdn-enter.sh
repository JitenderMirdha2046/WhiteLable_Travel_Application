#!/bin/bash
# Undo PgDn → Enter system-level remapping
# Run with: sudo bash undo-pgdn-enter.sh
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
    echo "Run with: sudo bash undo-pgdn-enter.sh"
    exit 1
fi

echo "=== Undoing PgDn→Enter remapping ==="

# 1. Stop & disable systemd service
echo "--- Stopping and removing systemd service ---"
systemctl stop pgdn-enter.service 2>/dev/null || true
systemctl disable pgdn-enter.service 2>/dev/null || true
rm -f /etc/systemd/system/pgdn-enter.service
systemctl daemon-reload

# 2. Remove udev hwdb
echo "--- Removing udev hwdb rule ---"
rm -f /etc/udev/hwdb.d/99-pgdn-enter.hwdb
systemd-hwdb update 2>/dev/null || true
udevadm trigger 2>/dev/null || true

# 3. Remove GRUB keymap
echo "--- Removing GRUB keymap ---"
rm -f /boot/grub/pgdn-enter.gkb
rm -f /etc/grub.d/40_custom_keymap
rm -f /etc/default/grub.d/pgdn-enter.cfg
sed -i '/^GRUB_KEYMAP=/d' /etc/default/grub
update-grub 2>/dev/null | tail -3 || echo "update-grub skipped (not available)"

# 4. Remove console keymap
echo "--- Removing console keymap ---"
rm -f /usr/share/keymaps/pgdn-as-enter.map

# 5. Remove X11/Xsession scripts
echo "--- Removing X11/Xsession scripts ---"
rm -f /etc/X11/xinit/xinitrc.d/99-pgdn-enter.sh
rm -f /etc/X11/Xsession.d/99-pgdn-enter-xmodmap

# 6. Load default console keymap
echo "--- Restoring default console keymap ---"
loadkeys -d 2>/dev/null || true

echo ""
echo "=============================================="
echo "  PgDn→Enter remapping fully undone"
echo "=============================================="
echo "  Reboot recommended to fully restore:"
echo "    • GRUB boot menu keymap"
echo "    • Console keymap at all TTYs"
