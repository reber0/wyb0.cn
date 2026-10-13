---
draft: false
isCJKLanguage: true
title: 利用 C 语言简单实现单重 DES
date: 2015-05-22 16:52:55
description: 
categories:
  - C
tags:
  - des
  - C 语言
---

### 0x00 简介

```
此程序通过单重des实现8个字节的加密和解密。
新建一个工程，这个工程需要3个cpp文件(c文件也可以)和2个头文件。
cpp文件：main.cpp、des.cpp、status.cpp
头文件：des.h、status.h
```

### 0x01 代码
* 以下为主函数main.cpp的内容：

```
#include <stdio.h>
#include "status.h"
#include "des.h"

int main()
{
    char M[8],Key[9];
    printf("Input Plaintext :");
    scanf("%s",&M);
    printf("Input Key :");
    scanf("%s",&Key);

    SetKey(Key);//生成16个子秘钥

    printf("加密：");
    Des(M,'e');
    printf("%s\n",M);

    printf("解密：");
    Des(M,'d');
    printf("%s\n",M);
    
    return 0;
}
```

* 以下为des.cpp的内容：

```
#include <stdio.h>
#include <string.h>
#include "status.h"
#include "des.h"

void ByteToBit(const char *In,bool *Out,int bits)
{
    for (int j=0;j<bits;j++)
        Out[j]=(In[j/8]>>(j%8))& 1;
}

void BitToByte(bool *In,char *Out,int bits)
{
    memset(Out,0,(bits+7)/8);
    for (int k=0;k<bits;k++)
        Out[k/8]|=In[k]<<(k%8);
}

void Transform(bool *Y,bool *X,const char *Table,int len)
{
    for (int l=0;l<len;l++)
        Temp[l]=X[Table[l]-1];
    memcpy(Y,Temp,len);
}

void Des(char *m,char ch)
{
    bool Tem[32];
    ByteToBit(m,P,64);
    Transform(P,P,IP1_Table,64);
    Li=&P[0];
    Ri=&P[32];

    if (ch=='e')
    {
        for (i=0;i<16;i++)
        {
            memcpy(Tem,Ri,32);//临时存放明文的右半部分
            f(Ri,SubKey[i]);
            XOR(Ri,Li,32);
            memcpy(Li,Tem,32);//将明文的右半部分写入Li
        }
    } 
    else
    {
        for (i=15;i>=0;i--)
        {
            memcpy(Tem,Li,32);//临时存放明文的右半部分
            f(Li,SubKey[i]);
            XOR(Li,Ri,32);
            memcpy(Ri,Tem,32);//将明文的右半部分写入Li
        }
    }

    Transform(P,P,IP2_Table,64);
    BitToByte(P,m,64);
}

void f(bool *R,bool *k)
{
    bool T[48];
    Transform(T,R,E_Table,48);//32位的Ri扩展为48位
    XOR(T,k,48);//Ri和轮秘钥的异或
    S_Box_f(T,R);
    Transform(R,R,P_Table,32);
}

void XOR(bool *R,bool *k,int len)
{
    for (int m=0;m<len;m++)
        R[m]=R[m]^k[m];
}

void S_Box_f(bool *B,bool *C)
{
    int a,b;
    for (int k=0;k<8;k++)
    {
        a=B[0]*2+B[5];
        b=B[1]*8+B[2]*4+B[3]*2+B[4];
        ByteToBit(&S_Box[k][a][b],C,4);
        B+=6;
        C+=4;
    }
}

//以下求得子秘钥
void SetKey(char *KEY)
{
    ByteToBit(KEY,K,64);
    Transform(K,K,PC1_Table,56);
    printf("\n\n\n");
    Ci=&K[0];
    Di=&K[28];
    for (int j=0;j<16;j++)
    {
        MovKey(Ci,28,LOOP_Table[j]);
        MovKey(Di,28,LOOP_Table[j]);
        Transform(SubKey[j],K,PC2_Table,48);
    }
}

void MovKey(bool *LR,int len,int loop)
{
    memcpy(Temp,LR,loop);
    memcpy(LR,LR+loop,len-loop);
    memcpy(LR+len-loop,Temp,loop);
}
```

* 以下为status.cpp中的内容：

```
#include "status.h"

int i;
bool P[64],K[64];
bool *Li,*Ri;
bool *Ci,*Di;
bool Temp[100];
bool SubKey[16][48];

//子密钥各轮移位位数
const char LOOP_Table[16]={
	1,1,2,2,2,2,2,2,1,2,2,2,2,2,2,1
};

//16轮乘积变换前的初始变换
const char IP1_Table[64]={
	58, 50, 42, 34, 26, 18, 10, 2,
		60, 52, 44, 36, 28, 20, 12, 4,
		62, 54, 46, 38, 30, 22, 14, 6,
        64, 56, 48, 40, 32, 24, 16, 8,
        57, 49, 41, 33, 25, 17, 9,  1,
        59, 51, 43, 35, 27, 19, 11, 3,
        61, 53, 45, 37, 29, 21, 13, 5,
        63, 55, 47, 39, 31, 23, 15, 7
};

//16轮乘积变换后的逆初始变换
const char IP2_Table[64]={
	40, 8, 48, 16, 56, 24, 64, 32,
		39, 7, 47, 15, 55, 23, 63, 31,
        38, 6, 46, 14, 54, 22, 62, 30,
        37, 5, 45, 13, 53, 21, 61, 29,
        36, 4, 44, 12, 52, 20, 60, 28,
        35, 3, 43, 11, 51, 19, 59, 27,
        34, 2, 42, 10, 50, 18, 58, 26,
        33, 1, 41, 9,  49, 17, 57, 25
};

//扩展置换，将32位的数据扩展为48位
const char E_Table[48]={
	32, 1,  2,  3,  4,  5,
		4,  5,  6,  7,  8,  9,
		8,  9,  10, 11, 12, 13,
		12, 13, 14, 15, 16, 17,
		16, 17, 18, 19, 20, 21,
		20, 21, 22, 23, 24, 25,
		24, 25, 26, 27, 28, 29,
		28, 29, 30, 31, 32, 1
};

//经过S盒后的P置换
const char P_Table[32]={
	16, 7,  20, 21, 29, 12, 28, 17,
		1,  15, 23, 26, 5,  18, 31, 10,
		2,  8,  24, 14, 32, 27, 3,  9,
		19, 13, 30, 6,  22, 11, 4,  25
};

//子密钥换位表PC-1
const char PC1_Table[56]={
	57, 49, 41, 33, 25, 17, 9,
		1,  58, 50, 42, 34, 26, 18,
		10, 2,  59, 51, 43, 35, 27,
		19, 11, 3,  60, 52, 44, 36,
		63, 55, 47, 39, 31, 33, 15,
		7,  62, 54, 46, 38, 30, 22,
		14, 6,  61, 53, 45, 37, 29,
		21, 13, 5,  28, 20, 12, 4
};

//子密钥换位表PC-2(去掉了PC-1的最后一列)
const char PC2_Table[48]={
	14, 17, 11, 24, 1,  5,
		3,  28, 15, 6,  21, 10,
		23, 19, 12, 4,  26, 8,
		16, 7,  27, 20, 13, 2,
		41, 52, 31, 37, 47, 55,
		30, 40, 51, 45, 33, 48,
		44, 49, 39, 56, 34, 53,
		46, 42, 50, 36, 29, 32
};

//S盒
const char S_Box[8][4][16]={
	{
		{14,4,13,1,2,15,11,8,3,10,6,12,5,9,0,7},//S1
		{0,15,7,4,14,2,13,1,10,6,12,11,9,5,3,8},
		{4,1,14,8,13,6,2,11,15,12,9,7,3,10,5,0},
		{15,12,8,2,4,9,1,7,5,11,3,14,10,0,6,13}
	},
	{
		{15,1,8,14,6,11,3,4,9,7,2,13,12,0,5,10},//S2
		{3,13,4,7,15,2,8,14,12,0,1,10,6,9,11,5},
		{0,14,7,11,10,4,13,1,5,8,12,6,9,3,2,15},
		{13,8,10,1,3,15,4,2,11,6,7,12,0,5,14,9}
	},
	{
		{10,0,9,14,6,3,15,5,1,13,12,7,11,4,2,8},//S3
		{13,7,0,9,3,4,6,10,2,8,5,14,12,11,15,1},
		{13,6,4,9,8,15,3,0,11,1,2,12,5,10,14,7},
		{1,10,13,0,6,9,8,7,4,15,14,3,11,5,2,12}
	},
	{
		{7,13,14,3,0,6,9,10,1,2,8,5,11,12,4,15},//S4
		{13,8,11,5,6,15,0,3,4,7,2,12,1,10,14,9},
		{10,6,9,0,12,11,7,13,15,1,3,14,5,2,8,4},
		{3,15,0,6,10,1,13,8,9,4,5,11,12,7,2,14}
	},
	{
		{2,12,4,1,7,10,11,6,8,5,3,15,13,0,14,9},//S5
		{14,11,2,12,4,7,13,1,5,0,15,10,3,9,8,6},
		{4,2,1,11,10,13,7,8,15,9,12,5,6,3,0,14},
		{11,8,12,7,1,14,2,13,6,15,0,9,10,4,5,3}
	},
	{
		{12,1,10,15,9,2,6,8,0,13,3,4,14,7,5,11},//S6
		{10,15,4,2,7,12,9,5,6,1,13,14,0,11,3,8},
		{9,14,15,5,2,8,12,3,7,0,4,10,1,13,11,6},
		{4,3,2,12,9,5,15,10,11,14,1,7,6,0,8,13}
	},
	{
		{4,11,2,14,15,0,8,13,3,12,9,7,5,10,6,1},//S7
		{13,0,11,7,4,9,1,10,14,3,5,12,2,15,8,6},
		{1,4,11,13,12,3,7,14,10,15,6,8,0,5,9,2},
		{6,11,13,8,1,4,10,7,9,5,0,15,14,2,3,12}
	},
	{
		{13,2,8,4,6,15,11,1,10,9,3,14,5,0,12,7},//S8
		{1,15,13,8,10,3,7,4,12,5,6,11,0,14,9,2},
		{7,11,4,1,9,12,14,2,0,6,10,13,15,3,5,8},
		{2,1,14,7,4,10,8,13,15,12,9,0,3,5,6,11}
	}
};
```

* 以下为des.h的内容：

```
//函数的声明

void ByteToBit(const char *In,bool *Out,int bits);//将字节转换为位
void BitToByte(bool *In,char *Out,int bits);//将位转换为字节
void Transform(bool *Y,bool *X,const char *Table,int len);//按表变换位置
void SetKey(char *KEY);//生成子秘钥
void MovKey(bool *LR,int len,int loop);//秘钥的LS移位
void Des(char *m,char ch);//DES
void XOR(bool *R,bool *k,int len);//异或
void S_Box_f(bool *B,bool *C);//在S盒置换
void f(bool *Ri,bool *k);//f函数
```

* 以下为status.h的内容：

```
//变量的声明

extern int i;
extern bool P[64],K[64];//存放明文和秘钥
extern bool *Li,*Ri;//指向明文的左右两部分
extern bool *Ci,*Di;//指向子秘钥的左右两部分
extern bool Temp[100];
extern bool SubKey[16][48];//存放16轮的秘钥

extern const char IP1_Table[64];
extern const char IP2_Table[64];
extern const char E_Table[48];
extern const char P_Table[32];
extern const char PC1_Table[56];
extern const char PC2_Table[48];
extern const char LOOP_Table[16];
extern const char S_Box[8][4][16];
```

### 0x02 执行结果
![单重DES运行结果](/img/post/des.png)
