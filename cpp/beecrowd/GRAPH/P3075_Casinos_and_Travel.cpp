#include <bits/stdc++.h>
using namespace std;
const int maxn=100000+5;
vector<int > g[maxn];
int deg[maxn],fac[maxn];
int n;
const int mo=1000000000+7;
void pre()
{
    fac[0]=1;
    for(int i=1;i<maxn;i++) fac[i]=(fac[i-1]<<1)%mo;
}
int main()
{
    pre();
    scanf("%d",&n);
    for(int i=0;i<n-1;i++){
        int from,to;
        scanf("%d%d",&from,&to);
        deg[from]++;deg[to]++;
    }
    int Ans=0,lef=0;
    for(int i=1;i<=n;i++){
        if(deg[i]==1) lef++;
    }
    for(int i=1;i<=n;i++){
        Ans=(Ans+fac[n-(lef-(deg[i]==1))])%mo;
    }
    printf("%d\n",Ans);
    return 0;
}