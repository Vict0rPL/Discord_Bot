const banners = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158], //0 all
    // aligment summons
    [8, 15, 21, 23, 24, 30, 57, 62, 71, 80, 89, 100, 112, 129, 147], //1 lawful-good
    [5, 10, 20, 25, 26, 27, 58, 63, 72, 81, 90, 101, 113, 130, 148], //2 neutral-good
    [3, 13, 22, 31, 32, 33, 55, 64, 73, 83, 91, 102, 114, 131, 149],  //3 chaotic-good
    [7, 12, 34, 35, 36, 37, 54, 65, 74, 82, 92, 103, 115, 132, 150],  //4 lawful-neutral
    [0, 14, 19, 38, 39, 40, 59, 66, 75, 84, 93, 104, 116, 133, 151],  //5 true neutral
    [1, 9, 11, 28, 41, 42, 60, 67, 76, 85, 94, 105, 117, 134, 152],  //6 chaotic-neutral
    [6, 16, 29, 43, 44, 45, 56, 68, 77, 86, 95, 106, 118, 135, 153],  //7 lawful-evil
    [4, 18, 46, 47, 52, 53, 61, 69, 78, 87, 96, 107, 119, 136, 154],  //8 neutral-evil 
    [2, 17, 48, 49, 50, 51, 57, 70, 79, 88, 97, 108, 120, 137, 155],  //9 chaotic-evil
    [98, 99, 109, 110, 111, 121, 122, 123, 124, 125, 126, 127, 128, 138, 139, 140, 141, 142, 143, 144, 145, 146, 156, 157, 158],// 10 all limited
    // special summons (with item as the catalyst)
    //      class summons
    [0, 5, 19, 23, 25, 45, 46, 71, 73, 74, 83, 86, 87, 91, 92, 113, 115, 116],// 11 bow (archer class only)
    [8, 15, 20, 27, 30, 31, 33, 43, 4, 53, 63, 64, 65, 72, 81, 84, 93, 100, 105, 114, 131, 140, 147],// 12 sword (saber class only)
    [7, 24, 26, 34, 36, 38, 51, 52, 76, 97, 101, 112, 119, 148],// 13 spear (lancer class only)
    [2, 10, 14, 18, 21, 35, 39, 47, 59, 67, 69, 94, 102, 106, 117, 130, 150],//14 magic wand (caster class only)
    [3, 12, 13, 37, 41, 48, 55, 58, 95, 120, 134],// 15 wheel (rider class only)
    [6, 11, 17, 29, 32, 44, 49, 56, 57, 60, 77, 85, 88, 96, 103, 118, 135, 144, 151, 154],// 16 knife (assassin class only)
    [1, 9, 16, 40, 42, 50, 54, 57, 61, 70, 129, 136],//17 'broken sword' (berserker class only)
    //     personal ones
    [0, 12, 13, 66, 68, 116, 134],// 18 gear 
    [5, 17, 26, 61, 87],// 19 'cigarette' (people who smoke)
    [17, 11, 12, 13, 14, 19, 48, 61, 68, 87, 92, 151, 153], // 20 'gun' (gun users)
    [2, 39, 53, 55, 57, 59, 70, 74, 75, 78, 79, 86, 87, 96, 104, 133],// 21 'notebook'(people related to books)
    [14, 18, 45, 69, 106, 155],// 22 'crystal ball'(future tellers, witches)
    [3, 29, 38, 40, 62, 151],// 23 'chain' 
    [4, 47, 53, 88, 92, 93, 114],// 24 'ramen' (old generation japanese servants)
    [10, 12, 15, 19, 20, 24, 28, 72, 76, 81, 104, 107, 115],// 25 'instant ramen' (new generation japanese servants)
    [9, 7, 34, 35, 48],// 26 'fishing rod' 
    [5, 17, 29, 135, 149],// 27 'poison'
    [17, 14, 24, 28, 72, 103, 108, 118],//28 'hourglass' (time related)
    [16, 63, 95, 117, 130],// 29 'thermometer' (temperature altering magic users - mostly cold)
    [14],// 30 pizza
    [31, 63, 108],// 31 rose
    [21],// 32 herb (healers, alchemists)
    [29, 58, 60, 102, 108, 120],// 33 wine 
    [28, 66, 67, 69, 74, 107, 116],// 34 lab coat
    [25, 55, 71, 33],// 35 telescope (space, stars...)
    [10, 49, 21, 59, 83, 91, 148, 153],// 36 candy (kids)
    [23, 22, 100, 103],// 37 silver
    [48, 41, 25, 71, 73, 83, 85, 96, 147],// 38 gold
    [20, 80, 131, 154],// 39 bread
    [32, 9, 102],//40 water
    [62, 149],//41 shield (shielder class only)
    [62, 120, 150],//42 rope
    [8, 27, 31, 35, 65, 74, 112, 130],//43 coal (fire users)
    [69, 19, 57, 77, 87, 89, 91, 144, 152],//44 glasses
    [42, 113, 134],//45 battery
    [60, 115, 124],//46 hibiscus
    [8, 27, 31, 35, 65, 74, 80, 92, 132, 136, 137],//47 match
    [82],//48 brick
    [82, 119],// 49 donut
    [84],// 50 link
    [87, 89],// 51 magnifying glass
    [90],// 52 diamond
    [90],// 53 emerald
    [90, 97, 3, 148],// 54 rock
    [28, 45, 93, 129],// 55 medicine
    [17, 94, 153, 154],// 56 tnt
    [2, 17, 36, 44, 54, 58, 30, 73, 98, 99],// 57 FATE/ZERO EVENT
    [104, 152],//58 'energy drink'
    [109, 110, 111, 0, 100, 1, 3, 4, 6, 7, 18, 30, 43, 73],// 59 FATE/STAY NIGHT EVENT
    [121, 9, 122, 9, 123, 9, 124, 9, 125, 9, 126, 9, 127, 9, 128, 9],// 60 summer event 1
    [138, 139, 140, 141, 0, 30, 43, 31, 33, 105, 93, 64, 15, 20, 131],//61 Saber Wars event
    [144],//62 chair
    [142, 143, 144, 145, 146, 10, 51, 118, 108, 32, 16, 22, 50, 137],//63 tsukihime event
    [156, 157, 158, 62, 85, 86, 87, 59, 21, 58, 90, 95, 134, 12 ],//64 christmas event


]

module.exports = banners;