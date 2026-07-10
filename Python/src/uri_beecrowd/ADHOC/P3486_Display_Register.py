# Date: 07-12-2025
# Author : Teerapat Phokhonwong
# Online judge: BEECROWD
# Categories: AD-HOC
# Problem: 3486 - Display Register
# Link: https://judge.beecrowd.com/en/problems/view/3486
# Timelimit: 1 sec
# Status: Accepted
# Submission: 7/12/25, 11:59 PM
# Runtime: 0.000
# Solution: bitwise operations
# Note: 
# >> (Right Shift) = เลื่อนบิตไปทางขวาเพื่อดึง field ที่ต้องการ
# & (Bitwise AND) = Mask เพื่อ extract เฉพาะบิตที่สนใจ


register_value = input()
new_mode_id = input()

# แปลงเป็น int โดยให้ Python ตรวจจับฐานเอง (0x = Hex, 0b = Binary, ไม่มี = Decimal)
register_value = int(register_value, 0)

power_on = (register_value >> 0) & 0b1 # bit 0: Power On
error = (register_value >> 1) & 0b1 # bit 1: Error
ready = (register_value >> 2) & 0b1 # bit 2: Ready
overheat = (register_value >> 3) & 0b1 # bit 3: Overheat
mode_id = (register_value >> 8) & 0xFF  # เอา 8 บิตจากตำแหน่ง 8-15

print("===========================")
print("      REGISTER STATE       ")
print("===========================")
print(f"  Power On    : {'Yes' if power_on else 'No'}")
print(f"  Error       : {'Yes' if error else 'No'}")
print(f"  Ready       : {'Yes' if ready else 'No'}")
print(f"  Overheat    : {'Yes' if overheat else 'No'}")
print(f"  Mode ID     : {new_mode_id}")
