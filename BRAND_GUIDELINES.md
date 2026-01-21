# 🎨 AURION - Brand & Design Guidelines

## Identidade Visual

### Logo AURION
A logo AURION apresenta:
- **Símbolo**: Triângulo estilizado com gradiente amarelo-laranja
- **Tipografia**: "AURION" em fonte sans-serif bold
- **Cores**: Gradiente vibrante que transmite energia e movimento
- **Significado**: O triângulo representa direção, crescimento e estabilidade no mercado financeiro

### Paleta de Cores Premium

#### Cores Principais
- **Navy Deep**: `hsl(228, 45%, 10%)` - #1a1a2e
  - Background principal, transmite profissionalismo e sofisticação
  
- **Golden Yellow**: `hsl(45, 100%, 50%)` - #FFD700
  - Cor primária, representa prosperidade e oportunidade

- **Vibrant Orange**: `hsl(15, 100%, 60%)` - #FF6B35
  - Cor secundária, energia e dinamismo

- **Amber Glow**: `hsl(30, 100%, 55%)` - Accent color
  - Detalhes e acentos, modernidade e inovação

#### Cores Funcionais
- **Success Green**: `hsl(142, 76%, 48%)` - Lucros e positivo
- **Loss Red**: `hsl(0, 84%, 60%)` - Prejuízos e alertas
- **Neutral Gray**: `hsl(220, 15%, 70%)` - Texto secundário

### Gradientes Signature

#### Gradiente Primário (Logo)
```css
linear-gradient(135deg, hsl(45 100% 50%) 0%, hsl(15 100% 60%) 100%)
```
Usado em: Headers, títulos principais, CTAs premium

#### Gradiente Accent
```css
linear-gradient(180deg, hsl(30 100% 55%) 0%, hsl(15 100% 60%) 100%)
```
Usado em: Elementos de destaque, badges, overlays

#### Gradiente Premium Overlay
```css
linear-gradient(135deg, hsl(45 100% 50% / 0.2) 0%, hsl(15 100% 60% / 0.2) 100%)
```
Usado em: Backgrounds sutis, camadas de profundidade

---

## Princípios de Design

### 1. Premium & Sofisticação
- Glass morphism com blur effects
- Shadows premium com glow sutil
- Bordas arredondadas (border-radius: 1rem)
- Spacing generoso entre elementos

### 2. Clareza & Legibilidade
- Hierarquia tipográfica clara
- Contraste adequado (WCAG AA+)
- Textos uppercase com tracking para labels
- Tamanhos de fonte adequados por contexto

### 3. Profundidade & Dimensão
- Uso de overlays com gradientes
- Box shadows em múltiplas camadas
- Backdrop blur para glass cards
- Glow effects em elementos ativos

### 4. Responsividade
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Touch-friendly: mínimo 44x44px para interativos
- Adaptação inteligente de layouts

---

## Componentes UI

### Glass Cards
```tsx
className="glass-card premium-border"
```
- Background: `bg-card/40` com backdrop-blur
- Border: `border border-border/50`
- Shadow: `shadow-premium`

### Status Indicators
- **Idle**: Gray muted
- **Running**: Accent orange com pulse
- **Profit**: Green com glow effect
- **Loss**: Red com atenção visual

### Interactive Elements
- Hover: Subtle scale (1.02) e brightness
- Active: Reduced scale (0.98)
- Focus: Ring em primary color
- Disabled: Opacity 0.5

---

## Tipografia

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

### Hierarquia
- **Display**: 3-5xl, bold, gradiente
- **Heading 1**: 2-4xl, bold, foreground
- **Heading 2**: xl-2xl, bold, gradiente/foreground
- **Body**: base, normal, foreground
- **Caption**: xs-sm, medium, muted-foreground
- **Label**: xs, medium, uppercase, tracking-wider

---

## Efeitos Visuais

### Shadows
- **Shadow Card**: Profundidade padrão
- **Shadow Premium**: Múltiplas camadas + glow sutil
- **Shadow Glow**: Efeito de brilho em elementos positivos
- **Shadow Glow Accent**: Brilho laranja em badges/status

### Animations
- **Pulse Subtle**: 2s ease para elementos ativos
- **Fade In**: 0.3s ease-out
- **Scale**: 0.2s ease-out
- Evitar animações muito rápidas ou bruscas

---

## Padrões de Uso

### Headers
- Logo AURION à esquerda
- Título principal com gradiente
- Métricas importantes à direita em glass cards
- Premium overlay sutil no background

### Cards de Operação
- Glass morphism com bordas coloridas
- Ícones em círculos com background colorido
- Separação clara entre seções
- PnL em destaque com glow quando positivo

### Dados Financeiros
- Sempre usar cores profit/loss consistentes
- Fonte mono para números
- Formatação clara: $1,234.56
- Percentuais com 2 casas decimais

### CTAs & Botões
- Primary: Gradiente amarelo-laranja
- Secondary: Outline com border colorido
- Destructive: Red sólido
- Ghost: Transparent com hover

---

## Acessibilidade

### Contraste
- Texto principal: 16:1 mínimo
- Texto secundário: 7:1 mínimo
- Elementos interativos: 4.5:1 mínimo

### Interação
- Keyboard navigation suportado
- Focus states visíveis
- ARIA labels adequados
- Skip links quando necessário

### Performance
- Lazy loading de imagens
- Code splitting por rota
- Cache inteligente (PWA)
- Otimização de assets

---

## Responsabilidade da Marca

### Valores
- **Transparência**: Informações claras e acessíveis
- **Segurança**: Proteção de dados e credenciais
- **Excelência**: Qualidade premium em cada detalhe
- **Inovação**: Tecnologia de ponta para trading

### Tom de Voz
- Profissional mas acessível
- Direto e objetivo
- Confiante sem ser arrogante
- Educativo quando necessário

---

## Checklist de Implementação

Ao criar novos componentes, verificar:
- [ ] Usa cores do design system (HSL)
- [ ] Glass cards onde apropriado
- [ ] Premium borders em elementos principais
- [ ] Gradientes aplicados corretamente
- [ ] Shadows e glows adequados
- [ ] Responsivo mobile-first
- [ ] Acessibilidade (contraste, keyboard)
- [ ] Animações sutis e performáticas
- [ ] Textos em uppercase tracking-wider para labels
- [ ] PnL com cores profit/loss consistentes

---

**AURION** - Premium Trading Platform
Onde tecnologia encontra sofisticação.
