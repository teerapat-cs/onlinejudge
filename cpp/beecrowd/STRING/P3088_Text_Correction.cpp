#include <iostream>
#include <cmath>
#include <iomanip>
using namespace std;

int main()
{
    string text;
    while (getline(cin, text))
    {
        for (int i = 1; i < text.size(); i++)
        {
            if ((text[i] == '.' or text[i] == ',') and text[i-1] == ' ')
            {
                text.erase(i - 1, 1);
                i--;
            }
        }
        cout << text << endl;
    }
    return 0;
} 