---
layout: post
title: "WoD大辞典"
subtitle: "WoD Know Hows: Terminology"
author: "楪祈"
tags:
  - WoD
  - Game
  - Terminology
typora-root-url: ../..
locale: zh-cn
---

## 角色

每个账号初始可以拥有一个激活中的角色，如果你的角色未激活（名字变红），那么他将处于休眠状态，需要你激活他才会继续进行冒险旅程。所以新人要保证你的主要角色时刻进行激活。

## 氪金

如果你想要激活更多英雄，或者尝试白金职业，那么你需要充值钻石。钻石只能通过Paypal购买，此处需要注意的是在重大节日，如新年、圣诞、复活节时会有优惠，能以同样的价格购买最多额外20%的钻石。购买钻石后，可以用50钻石/月（以优惠价计算，大约16元人民币）购买白金会员，便能激活2个角色，并使用全部职业。开通白金后再额外激活一个英雄需要25钻石/月。

可创建英雄的数量如下表。

|                  | 可激活角色数量 | 可创建角色总数 |
| ---------------- | -------------- | -------------- |
| 免费             | 1              | 3              |
| 白金             | 2              | 6              |
| 白金+额外激活1个 | 3              | 7              |
| 白金+额外激活2个 | 4              | 8              |
| 白金+额外激活3个 | 5              | 9              |
| 白金+额外激活4个 | 6              | 10             |

## 属性

每个角色初始都有力量、灵巧、感知、智力、魅力、敏捷、意志、体质8项属性，每种属性有不同作用。

<details><summary>各个属性的影响</summary>
{% highlight plaintext %}
力量 st 影响近战远程伤害和体力
体质 co 影响体力（比力量的影响大）
智力 in 影响法力和魔法防御
灵巧 dx 影响近战远程命中和近战躲闪
魅力 ch 影响诅咒和治愈能力，诅咒攻击命中和躲闪
敏捷 ag 影响近战躲闪和远程伤害及出手速度
感知 pe 影响远程命中和躲闪及出手速度
意志 wi 影响魔法和诅咒躲闪，法力（比智力影响大）
体力 3*体质+2*力量
法力 3*意志+2*智力
先攻 2*敏捷+感知
{% endhighlight %}
</details>

## 攻击

即命中骰，当角色的攻击命中超过目标的防御躲闪数值时，即可击中目标。超出一倍时可以打出`致命一击`效果。

每个技能都拥有各自不同的roll点计算公式，比如[能量魔法：魔法飞弹](http://canto.world-of-dungeons.org/wod/spiel/hero/skill.php?name=%E8%83%BD%E9%87%8F%E6%B3%95%E6%9C%AF%EF%BC%9A%E9%AD%94%E6%B3%95%E9%A3%9E%E5%BC%B9)，他的攻击属性是`感知，智力`，那么我们就可以知道他的命中roll的期望值是`２×感知＋智力＋２×能量法术：魔法飞弹`，同理，伤害属性是`意志，体质`，那么伤害roll的期望就是`意志÷２＋体质÷３＋能量法术：魔法飞弹÷２`。

## 防御

即防御骰，决定了对手攻击你时，你能否躲开对手的攻击。对于前排的`门板`（T）玩家来说，能否通过防御骰躲过全部的攻击，或者通过护甲中和敌人的伤害，就是全队能否存活的关键。

<details><summary>各种躲闪公式（不计算技能影响）</summary>
{% highlight plaintext %}
近战 2*敏捷+灵巧
远程 2*敏捷+感知
魔法 2*意志+智力
心理 2*意志+魅力
诅咒 2*魅力+意志
疾病 2*体质+魅力
陷阱 2*感知+敏捷
自然 2*意志+敏捷
偷袭 2*感知+智力
爆破 2*敏捷+感知
冲击 2*灵巧+力量
魔法弹 2*智力+敏捷
撞击 3*敏捷
{% endhighlight %}
</details>


## 伤害

即命中后的伤害值，伤害类型包括了粉碎伤害、切割伤害、穿透伤害、火焰伤害、寒冷伤害等等许多种不同的伤害效果。

## 护甲

即被命中后受到伤害时的减免数值，比如在脆弱性默认的情况下，角色有[8/5/0]（普通、重击、致命的护甲值）的粉碎伤害护甲，那么当对手对你造成粉碎伤害时，会根据伤害是普通、重击、致命来直接减免对应数值。如果是普通粉碎伤害9点，那么由于你有8点普通粉碎护甲，则只收到1点粉碎伤害。如果是致命粉碎伤害21点，由于你没有致命粉碎护甲，则受到全额伤害。护甲可以在`属性页面`下方查看。

## 脆弱性

与抗性相对，表示透过护甲的伤害对你造成影响的程度。

举一个简单的例子，你拥有10点近战粉碎致命护甲，你的近战粉碎致命脆弱性为50%，那么当敌人的巨锤落下，产生致命一击，造成100点粉碎伤害时，你受到的伤害就是`(100-10)*50%=45点`。更复杂的情况请参看[记录者小屋 - 脆弱性](http://canto.world-of-dungeons.org/wod/spiel/forum/viewtopic.php?id=1440733&board=kein)。

## 技能

根据种族和职业的不同，每个角色都有他独特的技能树，你需要消耗经验和金钱去提升你的技能等级。

## 经验

角色成长过程中不断获得经验，经验可以提升你的属性和技能，并且当你使用经验达到一定程度可以提升你的等级。所以新人发现没升级不要慌张，那是因为你没有使用你的经验，WoD升级是需要玩家自行主动提升的。

## 仓库

角色在冒险过程中会不断获得各种收获，这些收获将会默认存在你的仓库中，而贮藏室是你账号下所有角色共用的私有仓库。你可以经常访问你的仓库去查看，并及时更新替换适合你的装备。你可以将一些不需要的东西存入团队仓库交由他人处理，并保持良好的团队沟通习惯。

团队唯一、英雄唯一的稀有物品，会自动进入团队的宝库中，并打上团队标记，这些装备将只能在团队内的人使用，一旦离开团队这些装备将自动回到宝库中避免流失。只有助理权限以上的队员才能取消团队标记将装备交予外人。

偷盗团仓将会受到法院严厉的惩罚（封号）。

## 设置

玩家需要在地城冒险之前提前将对你的角色将要在地城中做什么进行设置，确保你的团队能够正常通过地城冒险。保持良好的设置习惯是你在WoD生存下来的保证。

## 团队

角色可以创建或加入一个团队，然后开始你的地城冒险。建议新人尽量在5级前寻找到你心怡的团队共同去冒险，建议点击`团队-团队搜索`进入团队论坛，发帖表达你的寻找团队诉求，很快就会有团队找上你的。

## 地城

即平时你所了解的副本。玩家每10小时可以进行一次地城冒险，所以WoD是个非常慢节奏的游戏。如果玩家点击了`快速进行下一次冒险`按钮，即可将你下次冒险旅途的间隔缩短至7小时。所以团队内需要有人经常上线点击`快速冒险`来提高团队的冒险效率。

## 先攻

每轮战斗开始时，会根据角色属性和先攻技能进行一次骰点，根据骰点顺序进行动作顺序排序，先攻越高越先出手。在没有先攻技能的情况下，先攻的期望值是`2×敏捷+感知`。

## 耐心

这个游戏的周期是以年为单位的，所以拥有耐心是你生存下来的关键。新人不要急于一时，多了解了解WoD的各种设定，寻找一个合适的团队才是你应该做的事情。



作者：[楪祈](http://canto.world-of-dungeons.org/wod/spiel/profiles/player.php?id=79747&session_hero_id=168332)

*祝武运昌隆  
DotIN13*