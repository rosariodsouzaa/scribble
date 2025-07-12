#include<stdio.h>
void xyz()
{
    int k=4;
    int m;
    m=++k*k*2;
    printf("%d ",m);
}
void main()
{
    int k=5;
    k=++k;
    xyz();
    xyz();
    printf("k=%d",k);
}
