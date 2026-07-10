# Date: 09-07-2026
# Author : Teerapat Phokhonwong
# Online judge: BEECROWD
# Categories: Ad-HOC
# Problem: 1109 - Cheating on the Contest
# Link: https://judge.beecrowd.com/en/problems/view/1109
# Timelimit: 1 sec
# Status: Accepted
# Submission: 7/9/26, 11:00:06 PM
# Runtime: 0.195s
# Solution: AST Tree + Backtracking + Memo
# Note:
# AST Tree -> โครงสร้างข้อมูลที่ใช้เก็บ regex หลัง parse เสร็จ
#   ประกอบด้วย node 4 ชนิด: Lit (ตัวอักษร), Star (ซ้ำ 0+ ครั้ง),
#   Dot (ต่อกัน), Or (เลือกอย่างใดอย่างหนึ่ง)
#
# Backtracking -> กลไกการ match โดยเดิน DFS บนต้นไม้ AST
#   จุดสำคัญคือ Star จะลอง match 0 ตัว, 1 ตัว, 2 ตัว, ... ไปเรื่อย ๆ
#   ถ้าทางไหนไปไม่รอด ก็ถอยกลับมาลองทางใหม่
#
# Memo -> ตัวเร่งความเร็ว โดยจำผลลัพธ์ของ (node, ตำแหน่งใน text)
#   ไว้ใน dict ถ้าเจอสถานะเดิมซ้ำ จะดึงจาก cache ทันที ไม่ต้องลองใหม่
#
# Precedence (ความสำคัญของ operator -> จากต่ำไปสูง):
#   | (alternation)  -> สำคัญน้อยสุด (เหมือนเครื่องหมาย + -)
#   . (concatenation)-> สำคัญปานกลาง (เหมือนเครื่องหมาย × ÷)
#   * (star)         -> สำคัญมาก (เหมือนเลขยกกำลัง)  จับคู่กับสิ่งที่อยู่ซ้ายสุดก่อน
#   a-z, (...)       -> สำคัญที่สุด (ตัวอักษรหรือกลุ่มในวงเล็บ)  ถูก parse ก่อนเสมอ
#
#   เพราะฉะนั้น parser จะเริ่มจากบน (alternation) -> concatenation -> star -> atom
#   แต่จริง ๆ แล้ว atom ถูก parse ก่อนเพราะถูกเรียกจากฟังก์ชันที่อยู่ล่างสุด


# node classes
class Lit:
    """Leaf node: ตัวอักษรเดี่ยว เช่น 'a', 'b', 'c'"""
    def __init__(self, ch):  self.ch = ch
    def __repr__(self): return f"Lit('{self.ch}')"

    def match(self, text, pos, memo):
        """
        รับ text = ข้อความเต็ม, pos = ตำแหน่งปัจจุบันใน text (0-based)
        memo = dict กันคำนวณซ้ำ -> key = (id(self), pos), value = set of positions
        return = {pos+1} ถ้า text[pos] == self.ch, {} ถ้าไม่ใช่
        ตัวอย่าง: Lit('a').match("abc", 0, memo) -> {1}  (กิน 'a' 1 ตัว จบที่ตำแหน่ง 1)
        """
        key = (id(self), pos)
        if key in memo:
            return memo[key]

        if pos < len(text) and text[pos] == self.ch:
            memo[key] = {pos + 1}
            return {pos + 1}

        memo[key] = set()
        return set()


class Dot:
    """Concatenation node: left ตามด้วย right (a.b = ab)"""
    def __init__(self, left, right):
        self.left = left
        self.right = right
    def __repr__(self): return f"Dot({self.left!r}, {self.right!r})"

    def match(self, text, pos, memo):
        """
        เรียก left.match() ก่อน -> ได้ set ของตำแหน่งที่ left จบ (mid)
        แล้วเรียก right.match() ต่อจากแต่ละ mid -> union ทุกผลลัพธ์
        return = set ของตำแหน่งที่ match ทั้ง left+right ได้
        ตัวอย่าง: Dot(Lit('a'), Lit('b')).match("abc", 0, memo) -> {2}
                 (a จบที่ 1, b จบที่ 2)
        """
        key = (id(self), pos)
        if key in memo:
            return memo[key]

        result = set()
        for mid in self.left.match(text, pos, memo):
            result |= self.right.match(text, mid, memo)
        memo[key] = result
        return result


class Or:
    """Alternation node: match ซ้าย หรือ ขวา ก็ได้ (a|b = a หรือ b)"""
    def __init__(self, left, right):
        self.left = left
        self.right = right
    def __repr__(self): return f"Or({self.left!r}, {self.right!r})"

    def match(self, text, pos, memo):
        """
        union ผลลัพธ์ของทั้งสองข้าง -> match ข้างไหนสำเร็จก็เก็บตำแหน่งนั้นไว้
        return = set ของตำแหน่งที่ match ได้จากทั้งสองข้างรวมกัน
        ตัวอย่าง: Or(Lit('a'), Lit('b')).match("abc", 0, memo) -> {1}
                 (a จบที่ 1, b ไม่ match -> รวมกัน = {1})
        """
        key = (id(self), pos)
        if key in memo:
            return memo[key]
        result = self.left.match(text, pos, memo) | self.right.match(text, pos, memo)
        memo[key] = result
        return result


class Star:
    """Kleene star node: child ซ้ำ 0 ครั้งขึ้นไป (a* = "", "a", "aa", ...)"""
    def __init__(self, child):  self.child = child
    def __repr__(self): return f"Star({self.child!r})"

    def match(self, text, pos, memo):
        """
        เริ่มจาก match 0 ตัว = {pos}
        แล้ววน loop ลองให้ child match ซ้ำไปเรื่อย ๆ (1 ตัว, 2 ตัว, ...)
        เก็บทุกตำแหน่งใหม่ที่ยังไม่เคยไปถึง
        หยุดเมื่อไม่มีตำแหน่งใหม่ หรือ child match empty string (กัน infinite loop)
        return = set ของทุกตำแหน่งที่ match ได้ (รวมถึง pos เดิม = match 0 ตัว)
        ตัวอย่าง: Star(Lit('a')).match("aaab", 0, memo) -> {0, 1, 2, 3}
                 (match 0 ตัว=0, 1 ตัว=1, 2 ตัว=2, 3 ตัว=3)
        """
        key = (id(self), pos)
        if key in memo:
            return memo[key]

        result = {pos}  # match 0 ตัว
        new_positions = {pos}
        while True:
            next_set = set()
            for p in new_positions:
                next_set |= self.child.match(text, p, memo)
            next_set -= result   # เอาเฉพาะตำแหน่งใหม่
            if not next_set:
                break
            result |= next_set
            new_positions = next_set
            # กัน infinite loop: ถ้า child match empty string ได้
            if pos in next_set and len(next_set) == len(new_positions):
                break

        memo[key] = result
        return result


# parser class ใช้ สร้าง AST จาก regex string
class Parser:
    def __init__(self, s: str):
        self.s = s       # regex string
        self.pos = 0     # index ปัจจุบัน

    def parse_alternation(self):
        """parse | (alternation) -> precedence ต่ำสุด"""
        left = self.parse_concatenation()

        while self.pos < len(self.s) and self.s[self.pos] == '|':
            self.pos += 1                          # กิน '|'
            right = self.parse_concatenation()
            left = Or(left, right)

        return left

    def parse_atom(self):
        """parse ตัวอักษร หรือกลุ่ม (...) -> precedence สูงสุด"""
        if self.s[self.pos] == '(':
            self.pos += 1
            node = self.parse_alternation()
            self.pos += 1
            return node
        else:
            ch = self.s[self.pos]
            self.pos += 1
            return Lit(ch)

    def parse_star(self):
        """parse * (star) -> precedence สูง"""
        node = self.parse_atom()

        while self.pos < len(self.s) and self.s[self.pos] == '*':
            self.pos += 1
            node = Star(node)

        return node

    def parse_concatenation(self):
        """parse . (concatenation) + implicit concat -> precedence กลาง"""
        left = self.parse_star()

        while self.pos < len(self.s) and self.s[self.pos] != ')' and self.s[self.pos] != '|':
            if self.s[self.pos] == '.':
                self.pos += 1  # กิน '.' (explicit concatenation)
            right = self.parse_star()
            left = Dot(left, right)

        return left


# main
import sys

lines = sys.stdin.read().splitlines()
answer = []
i = 0

while i < len(lines):
    # ข้ามบรรทัดว่างที่คั่นระหว่าง test cases (แต่ไม่ใช่ empty string test case)
    while i < len(lines) and lines[i] == '':
        i += 1
    if i >= len(lines):
        break

    regex = lines[i]
    i += 1
    parser = Parser(regex)
    root = parser.parse_alternation()

    n = int(lines[i])
    i += 1

    for _ in range(n):
        text = lines[i]  # ไม่ strip - empty string test case ต้องเป็น ""
        i += 1
        memo = {}
        results = root.match(text, 0, memo)
        if len(text) in results:
            answer.append("Y\n")
        else:
            answer.append("N\n")

    answer.append("\n")  # แยก test case ด้วยบรรทัดว่าง

print("".join(answer), end="")