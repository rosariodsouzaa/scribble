/**
 * WordClueService Domain Service
 * Provides rich semantic, conceptual, and thematic clues for all words in the dictionary.
 * For example: "blockchain" -> "A distributed ledger heavily used in cryptography and Web3"
 */
export class WordClueService {
  static HINT_COST = 100;
  static MAX_HINTS_PER_MATCH = 2;

  static CURATED_CLUES = {
    // Tech & Web3
    blockchain: "A distributed ledger heavily used in cryptography and Web3 to record tamper-proof transactions.",
    bitcoin: "The pioneer decentralized cryptocurrency created by the pseudonymous Satoshi Nakamoto.",
    server: "A high-powered computer architecture dedicated to managing, storing, and serving network requests.",
    laptop: "A portable personal folding computer featuring an integrated keyboard, trackpad, and screen.",
    robot: "An automated electro-mechanical machine programmed to carry out intricate tasks autonomously.",
    metaverse: "An immersive, persistent shared virtual reality environment where digital avatars interact.",
    satellite: "An artificial celestial object placed into orbit around a planet to relay communications or data.",
    laser: "A concentrated, coherent optical device that emits a single wavelength beam of focused light.",
    cyberpunk: "A gritty subgenre of science fiction characterized by high tech, artificial intelligence, and low life.",
    hacker: "A highly skilled technologist who navigates, explores, or breaches digital security barriers.",
    drone: "An unmanned autonomous or remotely piloted aerial vehicle equipped with rotors and cameras.",
    rocket: "A cylindrical aerospace vehicle propelled by thrust from expelling high-speed combusted gas.",
    "artificial intelligence": "The algorithmic simulation of human cognition, reasoning, and synthesis by software machines.",
    keyboard: "An input peripheral panel outfitted with lettered keys, numerals, and command buttons.",
    headphones: "A wearable pair of miniature acoustic speakers designed to fit snugly over or in the ears.",
    microchip: "A minute semiconductor wafer imprinted with billions of microscopic integrated electronic circuits.",
    "vr headset": "A wearable stereoscopic visor that projects simulated 360-degree three-dimensional digital worlds.",
    spaceship: "An advanced exploratory vessel crafted to withstand the vacuum of interstellar cosmos.",
    battery: "An electrochemical container storing chemical potential energy to power electronic devices.",

    // Dynasty & Lore
    dragon: "A legendary mythical winged reptilian beast known in folklore for breathing roaring flame.",
    samurai: "An elite, disciplined warrior of feudal Japan bound by honor and renowned for wielding a katana.",
    katana: "A traditional single-edged, gracefully curved steel sword famed for its lethal sharpness.",
    emperor: "The supreme monarch who holds sovereign dominion over an entire sprawling imperial dynasty.",
    temple: "A sacred sanctuary consecrated for spiritual contemplation, ancient rites, and veneration.",
    pagoda: "A majestic tiered tower with sweeping curved eaves, prevalent in East Asian classical architecture.",
    lotus: "A revered aquatic blossom that rises in pristine beauty from muddy pond waters.",
    phoenix: "A mythical immortal firebird that bursts into flame upon death and rises reborn from its own ashes.",
    scroll: "A roll of parchment or silk inscribed with ancient wisdom, secret decrees, or sacred runes.",
    lantern: "A portable or hanging illumination vessel sheltering a warm glowing candle flame inside.",
    palace: "A grandiose fortified royal residence adorned with imperial courts, throne halls, and gardens.",
    throne: "The ceremonial, elevated seat reserved exclusively for a reigning monarch or dynasty emperor.",
    bamboo: "A rapid-growing, hollow-stemmed woody grass celebrated for resilience and versatile craftsmanship.",
    bonsai: "The ancient horticultural art of cultivating miniaturized, perfectly proportioned ornamental trees.",
    jade: "A precious, lustrous ornamental green mineral deeply prized in dynasty culture for carvings and seals.",
    warrior: "A courageous combatant experienced in martial warfare, battlefield strategy, and honorable combat.",
    monk: "A devout spiritual practitioner who has taken vows of discipline, meditation, and simplicity.",
    archery: "The martial discipline and precision art of shooting feathered arrows with a strung bow.",
    firework: "A festive pyrotechnic device that detonates with vibrant sparks, booming bursts, and radiant colors.",
    gong: "A large, resonant metal disc that reverberates with a deep, echoing chime when struck.",
    fan: "A folding handheld instrument waved to produce a cooling breeze, often adorned with silk paintings.",
    silk: "A shimmering, delicate natural protein fiber harvested from silkworm cocoons to weave regal garments.",

    // Anime & Pop Culture
    pikachu: "An iconic electric yellow rodent pokemon capable of discharging thunderbolts from its red cheeks.",
    naruto: "An enthusiastic orange-clad ninja striving to earn the respect of his village and become Hokage.",
    ninja: "A covert shinobi operative stealthily skilled in espionage, acrobatics, and concealed weaponry.",
    wizard: "A master of arcane enchantments, spellcraft, and esoteric secrets who wields a magical staff.",
    potion: "A brewed elixir or alchemical concoction sealed in a glass flask to restore vigor or grant effects.",
    joystick: "A directional gaming control lever mounted on a base to maneuver characters across screens.",
    superhero: "A costumed heroic champion endowed with extraordinary superhuman powers to protect the innocent.",
    titan: "A colossal, towering humanoid behemoth possessing cataclysmic physical strength and endurance.",
    shinobi: "A traditional stealth warrior trained in clandestine arts, ninjutsu, and shadowy reconnaissance.",
    pokemon: "Pocket monster creatures that trainers collect, raise, and battle in sanctioned league arenas.",
    "sword art": "A famous virtual reality gaming universe where warriors fight to conquer a floating iron castle.",
    dragonball: "Seven mystical orange orbs that, when gathered, summon an eternal wish-granting dragon.",
    "death note": "A supernatural black notebook that grants its bearer the grim power to eliminate anyone whose name is written inside.",
    kunai: "A versatile, leaf-shaped iron dagger with a ring pommel, standard issue for covert shinobi.",
    shuriken: "A sharpened steel throwing star designed for swift, concealed ranged attacks in the dark.",
    mecha: "A colossal, armored piloted robotic combat suit equipped with high-tech artillery.",
    guild: "An allied fellowship of adventurous questers, artisans, or warriors united under a shared crest.",
    spellbook: "A leather-bound grimoire inscribed with incantations, mystic glyphs, and arcane formulas.",

    // Animals
    tiger: "A majestic striped apex feline predator possessing lethal claws and a fierce golden-orange coat.",
    lion: "The magnificent 'King of the Jungle' recognized by the male's luxurious golden mane and thunderous roar.",
    elephant: "The largest living land mammal, famous for its long prehensile trunk, ivory tusks, and broad ears.",
    giraffe: "The tallest terrestrial animal on Earth, characterized by an extraordinarily long neck and spotted hide.",
    monkey: "An agile tree-dwelling primate with a prehensile tail and a playful, inquisitive demeanor.",
    panda: "A beloved black-and-white bear native to mountain bamboo groves of China.",
    penguin: "A flightless aquatic seabird that waddles on polar ice and swims gracefully with tuxedo-like feathers.",
    kangaroo: "An Australian marsupial equipped with powerful hind legs for bounding and a pouch for its joey.",
    dolphin: "A remarkably intelligent marine mammal known for playful acrobatics and echolocation clicks.",
    whale: "A gigantic ocean-dwelling mammal that breathes air through a blowhole atop its head.",
    shark: "A sleek apex marine carnivore equipped with rows of razor-sharp teeth and a prominent dorsal fin.",
    octopus: "A highly intelligent, eight-armed cephalopod capable of camouflage and expelling dark ink.",
    turtle: "A tranquil reptile protected by a hard bony carapace shell into which it can retract its limbs.",
    rabbit: "A quick-footed small mammal with long upright ears, a twitching nose, and a fluffy cotton tail.",
    snake: "A limbless, elongated carnivorous reptile that slithers silently across the ground.",
    crocodile: "A formidable predatory reptile lurking in murky waters with a long snout and armored scales.",
    frog: "An amphibious creature renowned for leaping with strong hind legs, webbed feet, and rhythmic croaks.",
    eagle: "A majestic bird of prey with razor-sharp talons, curved beak, and remarkable soaring eyesight.",
    owl: "A nocturnal feathered predator with huge forward-facing eyes, silent flight, and a rotating neck.",
    flamingo: "A tall, slender wading bird with vibrant pink plumage that frequently balances on a single leg.",
    peacock: "A splendid male pheasant famed for fanning out an iridescent, eye-spotted tail train.",
    butterfly: "A delicate winged insect that undergoes metamorphosis from a caterpillar into colorful flutter.",
    bee: "A industrious fuzzy pollinating insect that lives in hives, makes honey, and defends with a sting.",
    spider: "An eight-legged arachnid that spins intricate silk webs to ensnare unwary prey.",
    scorpion: "An arachnid bearing grasping pincers and an arched segmented tail tipped with a venomous stinger.",
    unicorn: "A legendary mythical white steed adorned with a single spiraling horn upon its forehead.",
    dinosaur: "An ancient prehistoric reptile that dominated the terrestrial Earth millions of years ago.",
    crab: "A ten-legged decapod crustacean that walks sideways and defends itself with sturdy pincers.",
    jellyfish: "A translucent, bell-shaped gelatinous sea creature trailing stinging tentacles through ocean currents.",
    cat: "A nimble domesticated feline companion fond of purring, chasing mice, and napping in sunlight.",
    dog: "Man's loyal domesticated canine companion known for keen senses, wagging tail, and protective warmth.",
    horse: "A strong, graceful four-legged herbivore domesticated for riding, pulling carriages, and galloping.",
    bear: "A heavy, furry omnivore known for hibernating in dens and foraging for berries and salmon.",
    fox: "A clever, bushy-tailed wild canine with reddish fur and keen hunting instincts.",
    wolf: "A pack-hunting wild canine that communicates through haunting howls under the moon.",
    zebra: "An African equine celebrated for its striking, individual pattern of black-and-white stripes.",
    hippo: "A massive, semi-aquatic African mammal with huge jaws that spends days submerged in river shallows.",
    camel: "A resilient desert beast of burden capable of enduring long journeys thanks to fatty humps.",

    // Food & Drink
    pizza: "A universally loved Italian baked flatbread layered with tomato sauce, melted mozzarella, and toppings.",
    burger: "A savory grilled beef patty nestled between halves of a sliced sesame bun with lettuce and cheese.",
    "ice cream": "A chilled, creamy sweet frozen dessert churned in waffle cones with diverse indulgent flavors.",
    cake: "A frosted confection baked from sweet batter, traditionally sliced to celebrate birthdays and triumphs.",
    donut: "A ring-shaped glazed or sugar-dusted fried dough pastry with a hollow center.",
    cookie: "A baked, handheld circular confection often loaded with chocolate chips or sweet spices.",
    popcorn: "Puffed kernels of heated corn seasoned with melted butter and salt, the quintessential movie snack.",
    sushi: "A refined Japanese delicacy combining seasoned vinegared rice with fresh raw seafood and seaweed.",
    sandwich: "Two slices of bread enclosing layers of meats, cheeses, crisp vegetables, and spreads.",
    apple: "A crisp, round orchard fruit with red or green skin, famously linked to Isaac Newton's gravity discovery.",
    banana: "An elongated, curved yellow tropical fruit packed with potassium that peels easily.",
    watermelon: "A colossal, juicy summer melon with a thick striped rind, sweet ruby flesh, and black seeds.",
    strawberry: "A heart-shaped red berry dotted with tiny exterior seeds, bursting with sweet-tart flavor.",
    grape: "A small, succulent orb growing in hanging clusters on vines, enjoyed fresh or fermented into wine.",
    pineapple: "A spiky, tropical crowned fruit with golden, tangy-sweet fibrous flesh inside.",
    cherry: "A pair of glossy red stone fruits connected by slender green stems, often topping sundaes.",
    avocado: "A buttery, nutrient-dense green fruit with a large pit, the superstar ingredient of guacamole.",
    lemon: "A bright yellow citrus fruit renowned for its sharp, sour acidity and zesty rind.",
    carrot: "A crunchy, tapering orange root vegetable celebrated for supporting healthy eyesight.",
    broccoli: "A nutritious green vegetable resembling miniature edible trees with clustered florets.",
    corn: "A golden grain growing in rows of sweet kernels on a leafy husk-wrapped cob.",
    mushroom: "An earthy, umbrella-shaped fungal cap that grows in damp forest soils and culinary dishes.",
    taco: "A folded crispy or soft tortilla shell stuffed with seasoned fillings, salsa, and cheese.",
    "hot dog": "A cooked frankfurter sausage cradled in an elongated, soft sliced bun with mustard.",
    "french fries": "Crisp, golden-brown deep-fried batons of potato dusted with salt.",
    pancake: "A flat, fluffy circular griddle cake stacked high and smothered in warm maple syrup.",
    waffle: "A crisp batter cake baked on a patterned iron press to create signature grid pockets.",
    chocolate: "A decadent confection crafted from roasted and ground cacao beans, loved worldwide.",
    coffee: "A rich, aromatic brewed caffeinated beverage prepared from roasted dark coffee beans.",
    tea: "An ancient soothing infusion steeped from dried Camellia leaves in boiling water.",

    // Objects & Tools
    clock: "A timekeeping instrument with rotating second, minute, and hour hands around a circular dial.",
    camera: "An optical device fitted with a lens and sensor to capture and freeze moments in photographs.",
    telephone: "A communication apparatus that transmits voice signals over wires or wireless cellular signals.",
    guitar: "A popular stringed acoustic or electric musical instrument played by strumming or picking frets.",
    piano: "A grand keyboard instrument producing melody when felt hammers strike internal tuned strings.",
    drum: "A percussion instrument featuring a stretched skin membrane struck with sticks or palms.",
    violin: "A delicate wooden acoustic instrument played by drawing a tensioned horsehair bow across four strings.",
    scissors: "A dual-bladed handheld shear pivotally connected to slice through paper, cloth, and hair.",
    umbrella: "A collapsible waterproof canopy on a central shaft used to ward off rain or intense sun.",
    backpack: "A canvas or leather carrying bag fitted with dual shoulder straps to haul gear on one's back.",
    glasses: "Optical lenses framed over the bridge of the nose to sharpen visual perception or block glare.",
    key: "A notched metal tool precisely cut to engage tumblers and unlock doors, safes, or chests.",
    lock: "A fastening mechanism opened only by entering the correct key, code, or biometric signature.",
    candle: "A cylinder of solid wax encasing an absorbent wick that burns with a gentle flickering flame.",
    lamp: "A decorative light fixture holding an electric bulb to cast ambient luminescence across a room.",
    flashlight: "A handheld battery-powered electric torch projecting a focused beam of illumination.",
    mirror: "A reflective silvered glass surface displaying an exact reverse likeness of whatever stands before it.",
    brush: "An artist or grooming tool with bristles bound to a handle for sweeping pigments or untangling hair.",
    pencil: "A slender wooden writing cylinder enclosing a core of graphite that can be erased.",
    book: "A bound collection of printed or handwritten paper pages containing stories, knowledge, or spells.",
    hammer: "A heavy-headed striking hand tool used to drive metal nails into wood or forge metal.",
    bucket: "A cylindrical open-top container with a curved handle for carrying water, paint, or sand.",
    trophy: "An ornate cup or statuette bestowed upon champions to commemorate glory and victory.",
    crown: "A jewel-encrusted circular headdress of pure gold denoting regal majesty and royal authority.",
    sword: "A bladed martial weapon featuring a sharp edge, pointed tip, and hilt with a crossguard.",
    shield: "A defensive piece of armor strapped to the forearm to deflect incoming blows and arrows.",
    bow: "A tensioned curved arch of flexible wood strung with cord, used to propel arrows.",
    ring: "A circular band of precious metal worn as an ornamental adornment or symbol of eternal devotion.",
    necklace: "A decorative chain, string of pearls, or pendant worn gracefully around the throat.",
    watch: "A compact personal timepiece strapped comfortably around the wrist.",
    shoe: "Protective, structured footwear designed with a durable sole to cushion steps on the path.",
    hat: "A head covering worn for warmth, shade, style, or ceremonial status.",

    // Vehicles
    car: "A four-wheeled motor vehicle engineered to transport passengers along paved roadways.",
    bicycle: "A two-wheeled pedal-powered conveyance steered by handlebars and driven by a linked chain.",
    motorcycle: "A high-speed, two-wheeled motorized bike with an engine between the rider's knees.",
    airplane: "A fixed-wing aircraft powered by jet engines or propellers that cruises through high skies.",
    helicopter: "An aircraft sustained and propelled in flight by one or more horizontal overhead rotating blades.",
    submarine: "A naval vessel engineered to navigate, dive, and operate completely submerged beneath ocean waves.",
    boat: "A floating watercraft designed for traveling over rivers, lakes, or coastal shallows.",
    ship: "A massive seafaring vessel constructed to transport cargo or passengers across vast oceans.",
    train: "A coupled locomotive pulling a sequence of railway cars along dual steel tracks.",
    bus: "A large public transit vehicle designed to transport dozens of commuters across designated city routes.",
    truck: "A heavy-duty motorized vehicle equipped with an open or closed freight cargo bed.",
    tractor: "A high-traction farm vehicle with giant rear tires, built to pull plows and agricultural machinery.",
    ambulance: "An emergency medical vehicle outfitted with flashing sirens and lifesaving trauma gear.",
    skateboard: "A short wooden deck mounted on four urethane wheels, propelled by pushing with the foot.",
    "hot air balloon": "A giant envelope filled with heated air that ascends gracefully, carrying a wicker basket aloft.",
    scooter: "A narrow platform with two small wheels steered by an upright handlebar.",

    // Nature & Architecture
    sun: "The radiant yellow dwarf star at the epicenter of our solar system providing light and warmth to Earth.",
    moon: "Earth's luminous natural satellite whose orbital phases govern oceanic tides and night skies.",
    star: "A luminous celestial sphere of plasma held together by its own gravity in deep outer space.",
    cloud: "A billowing atmospheric condensation of water droplets or ice crystals floating overhead in the sky.",
    rainbow: "A breathtaking multicolored meteorological arc produced when sunlight refracts through raindrops.",
    lightning: "A sudden, blinding electrical electrostatic discharge between clouds and the ground during a storm.",
    rain: "Liquid moisture falling in drops from atmospheric condensation onto the earth.",
    snow: "Delicate atmospheric water vapor frozen into intricate hexagonal crystalline ice flakes.",
    volcano: "A geological rupture in the Earth's crust that erupts with molten lava, ash, and volcanic gases.",
    mountain: "A colossal elevated landform with steep rock faces rising high above surrounding terrain.",
    river: "A natural flowing watercourse winding through valleys until it merges into an ocean or lake.",
    waterfall: "A dramatic cascade of water plunging sheerly over a precipice into a churning pool below.",
    island: "A tract of land surrounded on all shores by open water.",
    beach: "A sandy or pebbled coastal shoreline where ocean waves gently lap against the land.",
    forest: "A dense expanse of land blanketed by tall trees, thick canopies, and teeming wildlife.",
    tree: "A perennial woody plant characterized by an upright trunk, spreading branches, and foliage.",
    flower: "The vibrant reproductive blossom of a plant, admired for fragrance and colorful petals.",
    cactus: "A spiny succulent plant adapted to survive the scorched aridity of desert climates.",
    campfire: "An outdoor blaze fueled by gathered logs, illuminating tents and warming gathered travelers.",
    cave: "A natural underground cavern or hollow chamber carved within rocky hillsides.",
    desert: "A vast arid landscape receiving minimal rainfall, dominated by rolling sand dunes or rocky flats.",
    planet: "A substantial celestial body orbiting a star, rounded by its own gravity and clearing its orbit.",
    galaxy: "A gravitationally bound cosmic system of billions of stars, interstellar gas, dust, and dark matter.",
    comet: "An icy celestial wanderer that releases a glowing coma and luminous dust tail near the sun.",
    house: "A domestic dwelling built to provide shelter, warmth, and sanctuary for a family.",
    castle: "A fortified medieval stronghold built with battlements, moats, and stone turrets for royalty.",
    pyramid: "A monumental ancient stone structure with triangular sloping faces meeting at an apex peak.",
    bridge: "An architectural span constructed to carry a path or roadway across a chasm, canyon, or river.",
    lighthouse: "A tall seaside tower projecting a powerful rotating beam of light to guide mariners safely.",
    tower: "A slender, lofty architectural structure standing tall for surveillance or grand aesthetics.",
    tent: "A portable fabric shelter supported by poles and pinned securely to the ground with stakes.",
    barn: "A traditional wooden agricultural storehouse for sheltering livestock, grain, and harvested hay.",
    windmill: "A wind-harnessed mill whose giant rotating sails drive mechanical grinding or water pumping.",
    igloo: "A dome-shaped shelter skillfully constructed from compressed blocks of arctic snow.",
    stadium: "A massive tiered sports arena designed to accommodate thousands of roaring spectators.",

    // Characters & Occupations
    king: "The crowned male sovereign ruling over a kingdom with an iron scepter.",
    queen: "The crowned sovereign monarch or royal consort ruling alongside or over an imperial court.",
    pirate: "A seafaring marauder who flies the skull-and-crossbones banner and hunts for buried treasure.",
    alien: "An extraterrestrial sentient being originating from a distant planet or galaxy.",
    ghost: "The eerie spectral apparition of a departed spirit lingering between worlds.",
    clown: "A circus entertainer sporting oversized shoes, colorful makeup, and a red bulb nose.",
    detective: "An investigator who examines forensic clues and unravels perplexing criminal mysteries.",
    doctor: "A trained medical professional who heals the sick and prescribes lifesaving treatments.",
    chef: "A master culinary artist who commands the kitchen to prepare gourmet dishes.",
    astronaut: "A courageous space explorer trained to conduct scientific missions aboard orbital spacecraft.",
    mermaid: "A mythical aquatic maiden with the upper body of a human and the scaled tail of a fish.",
    snowman: "A whimsical winter sculpture made of rolled snowballs with coal eyes and a carrot nose.",
    scarecrow: "A straw-stuffed mannequin dressed in tattered overalls placed in fields to deter crows.",
  };

  /**
   * Retrieves a conceptual, thematic, or semantic clue for a given secret word.
   * If a curated clue is registered, returns it. Otherwise, produces an intelligent structural fallback.
   * @param {string} rawWord 
   * @returns {string}
   */
  static getClue(rawWord) {
    if (!rawWord) return "Seek and you shall discover the hidden riddle.";

    const normalized = String(rawWord).trim().toLowerCase();

    // 1. Check curated catalog
    if (WordClueService.CURATED_CLUES[normalized]) {
      return WordClueService.CURATED_CLUES[normalized];
    }

    // 2. Check for partial matches or multi-word clues
    for (const [key, clue] of Object.entries(WordClueService.CURATED_CLUES)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return clue;
      }
    }

    // 3. Fallback semantic generator based on properties
    const len = normalized.length;
    const firstLetter = normalized[0].toUpperCase();
    const lastLetter = normalized[len - 1].toUpperCase();

    return `An enigmatic concept of ${len} runes. It begins with "${firstLetter}" and culminates with "${lastLetter}". Listen to the drawer's strokes.`;
  }
}
