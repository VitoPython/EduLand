import random

def dom():
    lista = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
    a = random.choice(lista)
    return a

print(dom())



def sort(przedmoit):
    czasy = {
        'karton': 'kartony',
    }
    if przedmoit in czasy:
        return f'{przedmoit} idze {czasy[przedmoit]}'
    
print(sort('karton'))