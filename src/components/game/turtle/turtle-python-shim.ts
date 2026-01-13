
export const TURTLE_PYTHON_SHIM = `
import js
import math
import time

# Constantes de cores básicas para facilitar para crianças
COLORS = {
    'vermelho': 'red',
    'azul': 'blue',
    'verde': 'green',
    'amarelo': 'yellow',
    'laranja': 'orange',
    'roxo': 'purple',
    'preto': 'black',
    'branco': 'white',
    'cinza': 'gray',
    'rosa': 'pink'
}

class Turtle:
    def __init__(self):
        self.speed_val = 5
        js.turtle_reset()
        
    def forward(self, distance):
        js.turtle_forward(float(distance))
        
    def fd(self, distance):
        self.forward(distance)
        
    def backward(self, distance):
        js.turtle_forward(float(-distance))
        
    def bk(self, distance):
        self.backward(distance)
        
    def right(self, angle):
        js.turtle_right(float(angle))
        
    def rt(self, angle):
        self.right(angle)
        
    def left(self, angle):
        js.turtle_right(float(-angle))
        
    def lt(self, angle):
        self.left(angle)
        
    def penup(self):
        js.turtle_penup()
        
    def pu(self):
        self.penup()
        
    def pendown(self):
        js.turtle_pendown()
        
    def pd(self):
        self.pendown()
        
    def color(self, color_name):
        # Traduz cores em português se necessário
        c = COLORS.get(color_name.lower(), color_name)
        js.turtle_color(c)
        
    def width(self, w):
        js.turtle_width(float(w))
        
    def speed(self, s):
        self.speed_val = s
        js.turtle_speed(float(s))

    def pencolor(self, color_name):
        self.color(color_name)

    def fillcolor(self, color_name):
        self.color(color_name)
        
    def circle(self, radius, extent=360):
        # Aproximação de círculo usando passos pequenos
        steps = 36
        step_length = 2 * math.pi * radius / steps
        step_angle = 360 / steps
        
        if extent != 360:
            steps = int(steps * (extent / 360))
            
        for _ in range(steps):
            self.forward(step_length)
            self.right(step_angle) # Assumindo sentido horário por padrão no circle simples

# Instância global para uso direto (ex: turtle.forward(10))
_default_turtle = Turtle()

def forward(distance): _default_turtle.forward(distance)
def fd(distance): _default_turtle.fd(distance)
def backward(distance): _default_turtle.backward(distance)
def bk(distance): _default_turtle.bk(distance)
def right(angle): _default_turtle.right(angle)
def rt(angle): _default_turtle.rt(angle)
def left(angle): _default_turtle.left(angle)
def lt(angle): _default_turtle.lt(angle)
def penup(): _default_turtle.penup()
def pu(): _default_turtle.pu()
def pendown(): _default_turtle.pendown()
def pd(): _default_turtle.pd()
def color(c): _default_turtle.color(c)
def width(w): _default_turtle.width(w)
def speed(s): _default_turtle.speed(s)
def circle(r, e=360): _default_turtle.circle(r, e)
def pencolor(c): _default_turtle.pencolor(c)
def fillcolor(c): _default_turtle.fillcolor(c)

# Aliases em português para crianças
def frente(d): forward(d)
def tras(d): backward(d)
def direita(a): right(a)
def esquerda(a): left(a)
def cor(c): color(c)
`;
