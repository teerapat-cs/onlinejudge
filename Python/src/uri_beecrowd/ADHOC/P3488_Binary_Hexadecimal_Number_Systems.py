# Date: 07-12-2025
# Author : Teerapat Phokhonwong
# Online judge: BEECROWD
# Categories: AD-HOC
# Problem: 3488 - Binary/Hexadecimal Number Systems
# Link: https://judge.beecrowd.com/en/problems/view/3488
# Timelimit: 1 sec
# Status: Accepted
# Submission: 7/12/25, 11:50 PM
# Runtime: 0.020
# Solution: bitwise operations
# Note: 
# ใช้ Bitwise AND
# ถ้า n เป็นกำลังของ 2 -> มันจะมีแค่ 1 bit ที่เป็น 1
# n & (n - 1) จะลบ bit 1 ตัวเดียวออก -> ผลลัพธ์ต้องเป็น 0
# ตัวอย่าง:
# 16 = 10000
# 15 = 01111
# 16 & 15 = 00000 -> เป็น Power of Two
# แต่:
# 18 = 10010
# 17 = 10001
# 18 & 17 = 10000 -> ไม่เท่ากับ 0
# **ถ้า n เป็นเลขยกกำลัง 2 (เช่น 16 = 10000) แล้ว n - 1 จะมีบิตต่ำกว่าทั้งหมดเป็น 1 (เช่น 15 = 01111) — เมื่อทำ & กันจะได้ 0 เสมอ 
# เพราะไม่มีบิตไหนตรงกันเลย


def is_power_of_two(n):
    return n > 0 and (n & (n - 1)) == 0
    
n = int(input())
if is_power_of_two(n):
    print("true")
else:
    print("false")