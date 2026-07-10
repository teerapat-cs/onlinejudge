# Date: 09-07-2026
# Author : Teerapat Phokhonwong
# Online judge: BEECROWD
# Categories: MATHEMATICS
# Problem: 1093 - Vampires
# Link: https://judge.beecrowd.com/en/problems/view/1093
# Timelimit: 1 sec
# Status: Accepted
# Submission: 7/10/26, 7:03:52 PM
# Runtime: 0.056s
# Solution: classic Gambler's Ruin Problem
# Note:
# EV1 and EV2 คือ Vampire 1 และ Vampire 2
# AT คือ Attack
# D คือ การโจมตี/ดูดเลือดของ Vampire 1 และ Vampire 2
# ตัวอย่างเช่น
# - ถ้าผลลูกเต๋า ≤ AT -> Vampire 1 ชนะเทิร์นนั้น
# - ถ้าผลลูกเต๋า > AT -> Vampire 2 ชนะเทิร์นนั้น
# round 1: EV1=7, EV2=5, AT=2 and D=4 | dice value เป็น 3 Vampire 2 ชนะ
# EV1=3 and EV2=9  * Vampire 2 ดูดเลือดจาก Vampire1 4 แต้ม -> EV1=3-4=-1 (Vampire 2 ชนะ)
# --------------------
# เมื่อคิดคามคณิตศาสตร์แล้วจะได้ว่า
# กำลังโยนลูกเต๋า 6 หน้า (ค่าที่ออกได้คือ 1, 2, 3, 4, 5, 6)
# ค่า | AT	             |  แต้มที่ทำให้ V1 ชนะ	ความน่าจะเป็น
# 1	 | 1	            |   1/6 ≈ 16.67%
# 2	 | 1, 2	            |   2/6 ≈ 33.33%
# 3	 | 1, 2, 3          |	3/6 = 50%
# 4	 | 1, 2, 3, 4       |	4/6 ≈ 66.67%
# 5	 | 1, 2, 3, 4, 5    |	5/6 ≈ 83.33%
# --------------------
# สูตรความน่าจะเป็นที่ V1 ชนะทั้งเกม
# ถ้า p = 0.5 (AT=3):    P₁ = a / (a+b)
# ถ้า p ≠ 0.5:           P₁ = (1 - r^a) / (1 - r^(a+b))
#                        โดย r = q/p = (6-AT)/AT
# คำตอบคูณด้วย 100 เพื่อเป็นเปอร์เซ็นต์ และแสดงทศนิยม 1 ตำแหน่ง



while True:
    EV1, EV2, AT, D = map(int, input().split())
    if EV1 == 0 and EV2 == 0 and AT == 0 and D == 0:
        break

    a = (EV1 + D - 1) // D    # ceil โดยไม่ใช้ math.ceil
    b = (EV2 + D - 1) // D

    if AT == 3:               # p == 0.5
        prob = a / (a + b)
    else:
        p = AT / 6.0
        q = 1.0 - p
        r = q / p              # หรือ r = (6 - AT) / AT
        prob = (1 - r**a) / (1 - r**(a + b))

    answer = prob * 100        # แปลงเป็น %
    print(f"{answer:.1f}")




# Input Sample	Output Sample
# 1 1 3 1           50.0
# 1 2 1 1           3.2    
# 8 5 3 1           61.5
# 7 5 2 4           20.0
# 0 0 0 0