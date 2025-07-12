//practice program
//rollno:23CO50 name:rosario
#include<iostream>
int fibo(int );
using namespace std;
int main()
{
    int n;
    cout<<"ENTER THE NUMBER OF TERMS ";
    cin>>n;
    for(int i=0;i<n;i++)
    {
        cout<<" "<<fibo(i);
    }
}
int fibo(int n)
{
    if(n==1 || n<1 )
        return 1;
    else
        return (fibo(n-1)+fibo(n-2));

}


