/**
 * @author Teerapat Phokhonwong
 * @Onlinejudge: URI Online Judge
 * @Categories: Data Structures and Libraries
 * @Problem: 1527 - Guilds
 * @Link: https://www.urionlinejudge.com.br/judge/en/problems/view/1527
 * @Timelimit: 1 sec
 * @LANGUAGE: C++17
 * @Status: Accepted
 * @Submission: 6/20/20, 12:52:08 AM
 * @Runtime: 0.284s
 * @Solution: 
 * @Note:
 */

#include <bits/stdc++.h>

using namespace std;

const int MN = 100000 + 10;
long long points[MN];
int p[MN];

int fs(int x) {
  return p[x] == x ? x : p[x] = fs(p[x]);
}

void js(int a, int b) {
  points[fs(a)] += points[fs(b)];
  p[fs(b)] = fs(a);
}

int main() {
  ios_base::sync_with_stdio(false);cin.tie(NULL);
  int n, m;
  while (cin >> n >> m && (n + m)) {
    for (int i = 0; i < n; ++i) {
      cin >> points[i];
      p[i] = i;
    }
    int q, a, b, ans = 0;
    for (int i = 0; i < m; ++i) {
      cin >> q >> a >> b;
      a--;b--;
      if (q == 1) {
        js(a, b);
      } else {
        if (fs(a) == fs(b)) continue;
        if (fs(a) == fs(0))
          ans += points[fs(a)] > points[fs(b)];
        if (fs(b) == fs(0))
          ans += points[fs(b)] > points[fs(a)];
      }
    }
    cout << ans << endl;
  }
  return 0;
}