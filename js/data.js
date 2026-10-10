// Dữ liệu ứng dụng ôn tập & kiểm tra Tiếng Anh lớp 9
const APP_DATA = {
  "test_info": {
    "title": "UNIT 3: HEALTHY LIVING FOR TEENS",
    "period": "Period 18: A CLOSER LOOK 2",
    "subject": "Tiếng Anh 9 (Global Success)",
    "teacher": "Mai Trần Diễm Phúc",
    "school": "THCS Nhuận Đức",
    "total_questions": 40,
    "time_minutes": 45,
    "passing_score": 5.0
  },
  "vocabulary": [
    {
      "word": "balanced diet",
      "pos": "n.phr",
      "ipa": "/ˈbælənst ˈdaɪət/",
      "meaning": "chế độ ăn uống cân bằng",
      "example": "You should have a balanced diet with more vegetables and less fat."
    },
    {
      "word": "physical health",
      "pos": "n.phr",
      "ipa": "/ˈfɪzɪkl helθ/",
      "meaning": "sức khỏe thể chất",
      "example": "Doing exercise regularly is good for your physical health."
    },
    {
      "word": "mental health",
      "pos": "n.phr",
      "ipa": "/ˈmentl helθ/",
      "meaning": "sức khỏe tinh thần",
      "example": "Meditation helps you relax and improve your mental health."
    },
    {
      "word": "stress out",
      "pos": "phr.v",
      "ipa": "/stres aʊt/",
      "meaning": "căng thẳng, lo âu quá mức",
      "example": "Don't stress out about the upcoming exam."
    },
    {
      "word": "manage time",
      "pos": "v.phr",
      "ipa": "/ˈmænɪdʒ taɪm/",
      "meaning": "quản lý thời gian",
      "example": "Students should learn how to manage time effectively."
    },
    {
      "word": "stay up late",
      "pos": "v.phr",
      "ipa": "/steɪ ʌp leɪt/",
      "meaning": "thức khuya",
      "example": "Teens should avoid staying up late to play games."
    },
    {
      "word": "give up",
      "pos": "phr.v",
      "ipa": "/ɡɪv ʌp/",
      "meaning": "từ bỏ, bỏ cuộc",
      "example": "I decided to give up online games to focus on studying."
    },
    {
      "word": "well-balanced",
      "pos": "adj",
      "ipa": "/ˌwel ˈbælənst/",
      "meaning": "cân bằng, điều độ, hài hòa",
      "example": "A well-balanced schedule gives you enough time for both study and rest."
    },
    {
      "word": "optimistic",
      "pos": "adj",
      "ipa": "/ˌɒptɪˈmɪstɪk/",
      "meaning": "lạc quan",
      "example": "Even in tough times, he remains completely optimistic."
    },
    {
      "word": "keep fit",
      "pos": "v.phr",
      "ipa": "/kiːp fɪt/",
      "meaning": "giữ dáng, duy trì cơ thể khỏe mạnh",
      "example": "I go jogging every morning to keep fit."
    },
    {
      "word": "work out",
      "pos": "phr.v",
      "ipa": "/wɜːk aʊt/",
      "meaning": "tập thể dục (thường ở phòng gym)",
      "example": "He works out at the gym for an hour every day."
    },
    {
      "word": "cut down on",
      "pos": "phr.v",
      "ipa": "/kʌt daʊn ɒn/",
      "meaning": "cắt giảm (đường, muối, thời gian màn hình...)",
      "example": "You need to cut down on fast food and sugary drinks."
    },
    {
      "word": "take up",
      "pos": "phr.v",
      "ipa": "/teɪk ʌp/",
      "meaning": "bắt đầu một thói quen/sở thích mới",
      "example": "She took up yoga to stay healthy and flexible."
    },
    {
      "word": "peer pressure",
      "pos": "n.phr",
      "ipa": "/ˈpɪə(r) ˈpreʃə(r)/",
      "meaning": "áp lực đồng trang lứa",
      "example": "Teenagers often face peer pressure to fit in with friends."
    },
    {
      "word": "prior",
      "pos": "adj",
      "ipa": "/ˈpraɪ.ər/",
      "meaning": "trước, ưu tiên hơn",
      "example": "No prior experience in volunteering is required."
    },
    {
      "word": "priority",
      "pos": "n",
      "ipa": "/praɪˈɒrəti/",
      "meaning": "sự ưu tiên hàng đầu",
      "example": "Health and studies should be your top priority."
    }
  ],
  "questions": [
    {
      "id": 1,
      "dialogue": [
        {
          "speaker": "Nam",
          "text": "I feel very tired and sleepy today."
        },
        {
          "speaker": "Lan",
          "text": "That's because you usually _____ to play games."
        }
      ],
      "options": {
        "A": "keep fit",
        "B": "stay up late",
        "C": "work out",
        "D": "give up"
      },
      "correct": "B",
      "vocab": "stay up late",
      "explanation": "'stay up late' nghĩa là thức khuya. Lan giải thích lý do Nam mệt mỏi và buồn ngủ là do thói quen thường thức khuya để chơi game."
    },
    {
      "id": 2,
      "dialogue": [
        {
          "speaker": "Dr. Smith",
          "text": "You should have a _____ with more vegetables and less fat."
        },
        {
          "speaker": "Hoa",
          "text": "Thank you, doctor."
        }
      ],
      "options": {
        "A": "balanced diet",
        "B": "peer pressure",
        "C": "mental health",
        "D": "physical health"
      },
      "correct": "A",
      "vocab": "balanced diet",
      "explanation": "'balanced diet' nghĩa là chế độ ăn uống cân bằng (nhiều rau, ít chất béo theo lời khuyên của bác sĩ)."
    },
    {
      "id": 3,
      "dialogue": [
        {
          "speaker": "Tom",
          "text": "I'm so _____ about the upcoming final exam."
        },
        {
          "speaker": "Jerry",
          "text": "Relax! You should take a break."
        }
      ],
      "options": {
        "A": "optimistic",
        "B": "well-balanced",
        "C": "stressed out",
        "D": "prior"
      },
      "correct": "C",
      "vocab": "stressed out",
      "explanation": "'stressed out' là căng thẳng, lo âu. Jerry khuyên Tom nên thư giãn và nghỉ ngơi vì Tom đang quá căng thẳng về kỳ thi."
    },
    {
      "id": 4,
      "dialogue": [
        {
          "speaker": "An",
          "text": "How do you _____, Minh?"
        },
        {
          "speaker": "Minh",
          "text": "I go jogging every morning and eat healthily."
        }
      ],
      "options": {
        "A": "manage time",
        "B": "give up",
        "C": "take up",
        "D": "keep fit"
      },
      "correct": "D",
      "vocab": "keep fit",
      "explanation": "'keep fit' nghĩa là giữ dáng / giữ cơ thể khỏe mạnh. Minh trả lời bằng việc chạy bộ mỗi sáng và ăn uống lành mạnh."
    },
    {
      "id": 5,
      "dialogue": [
        {
          "speaker": "Mai",
          "text": "I want to lose weight."
        },
        {
          "speaker": "Long",
          "text": "You should _____ fast food and sugary drinks."
        }
      ],
      "options": {
        "A": "cut down on",
        "B": "take up",
        "C": "stress out",
        "D": "stay up late"
      },
      "correct": "A",
      "vocab": "cut down on",
      "explanation": "'cut down on' nghĩa là cắt giảm. Muốn giảm cân thì nên cắt giảm thức ăn nhanh và đồ uống có đường."
    },
    {
      "id": 6,
      "dialogue": [
        {
          "speaker": "Peter",
          "text": "I've just _____ yoga to improve my flexibility."
        },
        {
          "speaker": "Mary",
          "text": "That's a great idea!"
        }
      ],
      "options": {
        "A": "given up",
        "B": "taken up",
        "C": "worked out",
        "D": "managed time"
      },
      "correct": "B",
      "vocab": "take up",
      "explanation": "'take up' nghĩa là bắt đầu một môn thể thao hoặc sở thích mới. Quá khứ phân từ là 'taken up'."
    },
    {
      "id": 7,
      "dialogue": [
        {
          "speaker": "Binh",
          "text": "I feel a lot of _____ because all my friends are so good at English."
        },
        {
          "speaker": "Chi",
          "text": "Don't worry, just focus on yourself."
        }
      ],
      "options": {
        "A": "physical health",
        "B": "anxiety",
        "C": "peer pressure",
        "D": "priority"
      },
      "correct": "C",
      "vocab": "peer pressure",
      "explanation": "'peer pressure' nghĩa là áp lực đồng trang lứa (cảm giác tự ti hoặc áp lực khi thấy bạn bè xung quanh học giỏi hơn)."
    },
    {
      "id": 8,
      "dialogue": [
        {
          "speaker": "Ms. Nga",
          "text": "What is your top _____ right now?"
        },
        {
          "speaker": "Dung",
          "text": "My biggest goal is to pass the entrance exam."
        }
      ],
      "options": {
        "A": "priority",
        "B": "anxiety",
        "C": "stress",
        "D": "diet"
      },
      "correct": "A",
      "vocab": "priority",
      "explanation": "'priority' nghĩa là sự ưu tiên. 'top priority' là ưu tiên hàng đầu, tương ứng với 'biggest goal' (mục tiêu lớn nhất)."
    },
    {
      "id": 9,
      "dialogue": [
        {
          "speaker": "Kevin",
          "text": "You look very _____ today!"
        },
        {
          "speaker": "Sarah",
          "text": "Yes, I believe everything will be fine."
        }
      ],
      "options": {
        "A": "anxious",
        "B": "stressed out",
        "C": "well-balanced",
        "D": "optimistic"
      },
      "correct": "D",
      "vocab": "optimistic",
      "explanation": "'optimistic' nghĩa là lạc quan. Sarah tin rằng mọi chuyện rồi sẽ ổn."
    },
    {
      "id": 10,
      "dialogue": [
        {
          "speaker": "Tuan",
          "text": "I have a lot of homework to do."
        },
        {
          "speaker": "Hung",
          "text": "You need to learn how to _____ more effectively."
        }
      ],
      "options": {
        "A": "work out",
        "B": "manage time",
        "C": "give up",
        "D": "keep fit"
      },
      "correct": "B",
      "vocab": "manage time",
      "explanation": "'manage time' nghĩa là quản lý thời gian hiệu quả khi có nhiều bài tập cần hoàn thành."
    },
    {
      "id": 11,
      "dialogue": [
        {
          "speaker": "Alice",
          "text": "Doing exercise regularly is good for your _____."
        },
        {
          "speaker": "Bob",
          "text": "I agree, it makes us stronger."
        }
      ],
      "options": {
        "A": "physical health",
        "B": "peer pressure",
        "C": "anxiety",
        "D": "stress out"
      },
      "correct": "A",
      "vocab": "physical health",
      "explanation": "'physical health' nghĩa là sức khỏe thể chất (tập thể dục giúp chúng ta khỏe mạnh hơn về mặt thể chất)."
    },
    {
      "id": 12,
      "dialogue": [
        {
          "speaker": "Yen",
          "text": "I feel a lot of _____ before every presentation."
        },
        {
          "speaker": "Cuong",
          "text": "Try to breathe deeply to stay calm."
        }
      ],
      "options": {
        "A": "priority",
        "B": "anxiety",
        "C": "optimism",
        "D": "health"
      },
      "correct": "B",
      "vocab": "anxiety",
      "explanation": "'anxiety' nghĩa là sự lo âu, bồn chồn (thường gặp trước mỗi buổi thuyết trình)."
    },
    {
      "id": 13,
      "dialogue": [
        {
          "speaker": "Duc",
          "text": "Why are you so sweaty?"
        },
        {
          "speaker": "Lien",
          "text": "I've just _____ at the gym for two hours."
        }
      ],
      "options": {
        "A": "cut down on",
        "B": "stayed up late",
        "C": "worked out",
        "D": "given up"
      },
      "correct": "C",
      "vocab": "work out",
      "explanation": "'work out' nghĩa là tập thể dục cường độ cao / tập gym (dẫn đến đổ nhiều mồ hôi)."
    },
    {
      "id": 14,
      "dialogue": [
        {
          "speaker": "Phuc",
          "text": "My _____ has improved since I started meditating."
        },
        {
          "speaker": "Hanh",
          "text": "That's wonderful to hear!"
        }
      ],
      "options": {
        "A": "physical health",
        "B": "mental health",
        "C": "peer pressure",
        "D": "diet"
      },
      "correct": "B",
      "vocab": "mental health",
      "explanation": "'mental health' nghĩa là sức khỏe tinh thần. Ngồi thiền (meditation) giúp cải thiện sức khỏe tinh thần rõ rệt."
    },
    {
      "id": 15,
      "dialogue": [
        {
          "speaker": "John",
          "text": "Is your daily schedule _____?"
        },
        {
          "speaker": "Linda",
          "text": "Yes, I have enough time for both study and rest."
        }
      ],
      "options": {
        "A": "well-balanced",
        "B": "prior",
        "C": "anxious",
        "D": "stressed out"
      },
      "correct": "A",
      "vocab": "well-balanced",
      "explanation": "'well-balanced' nghĩa là cân đối, hài hòa. Thời gian biểu cân đối khi có đủ thời gian cho cả học tập và nghỉ ngơi."
    },
    {
      "id": 16,
      "dialogue": [
        {
          "speaker": "Vy",
          "text": "I'm going to _____ smoking for a healthier life."
        },
        {
          "speaker": "Kien",
          "text": "Good for you! It's a very bad habit."
        }
      ],
      "options": {
        "A": "take up",
        "B": "keep fit",
        "C": "work out",
        "D": "give up"
      },
      "correct": "D",
      "vocab": "give up",
      "explanation": "'give up' nghĩa là từ bỏ (bỏ thuốc lá để có một cuộc sống lành mạnh hơn)."
    },
    {
      "id": 17,
      "dialogue": [
        {
          "speaker": "David",
          "text": "Did you have any _____ experience in volunteering?"
        },
        {
          "speaker": "Emma",
          "text": "No, this is my first time."
        }
      ],
      "options": {
        "A": "prior",
        "B": "optimistic",
        "C": "anxious",
        "D": "balanced"
      },
      "correct": "A",
      "vocab": "prior",
      "explanation": "'prior' (tính từ) nghĩa là trước đó. 'prior experience' nghĩa là kinh nghiệm có từ trước."
    },
    {
      "id": 18,
      "dialogue": [
        {
          "speaker": "Trang",
          "text": "You look very _____. What's wrong?"
        },
        {
          "speaker": "Son",
          "text": "I lost my house key and can't get in."
        }
      ],
      "options": {
        "A": "optimistic",
        "B": "well-balanced",
        "C": "anxious",
        "D": "prior"
      },
      "correct": "C",
      "vocab": "anxious",
      "explanation": "'anxious' (tính từ) nghĩa là lo lắng, bồn chồn. Sơn bị mất chìa khóa nhà nên rất lo lắng."
    },
    {
      "id": 19,
      "dialogue": [
        {
          "speaker": "Mr. Tan",
          "text": "Teens should avoid _____ to protect their health."
        },
        {
          "speaker": "Students",
          "text": "Yes, teacher."
        }
      ],
      "options": {
        "A": "keeping fit",
        "B": "staying up late",
        "C": "working out",
        "D": "taking up"
      },
      "correct": "B",
      "vocab": "stay up late",
      "explanation": "'stay up late' (sau avoid dùng V-ing: staying up late) nghĩa là thức khuya. Thanh thiếu niên nên tránh thức khuya."
    },
    {
      "id": 20,
      "dialogue": [
        {
          "speaker": "Nick",
          "text": "I'm trying to _____ salt in my meals."
        },
        {
          "speaker": "Rose",
          "text": "Me too, it's better for our blood pressure."
        }
      ],
      "options": {
        "A": "cut down on",
        "B": "manage time",
        "C": "stress out",
        "D": "give up"
      },
      "correct": "A",
      "vocab": "cut down on",
      "explanation": "'cut down on' nghĩa là cắt giảm bớt lượng muối trong bữa ăn để tốt cho huyết áp."
    },
    {
      "id": 21,
      "dialogue": [
        {
          "speaker": "Linda",
          "text": "You look tired these days."
        },
        {
          "speaker": "Mark",
          "text": "I know. I often _____ to finish my homework."
        }
      ],
      "options": {
        "A": "give up",
        "B": "stay up late",
        "C": "work out",
        "D": "take up"
      },
      "correct": "B",
      "vocab": "stay up late",
      "explanation": "'stay up late' nghĩa là thức khuya để làm bài tập, dẫn đến việc trông mệt mỏi dạo gần đây."
    },
    {
      "id": 22,
      "dialogue": [
        {
          "speaker": "Anna",
          "text": "Why do you eat so many vegetables and fruits?"
        },
        {
          "speaker": "Peter",
          "text": "Because I want to have a _____"
        }
      ],
      "options": {
        "A": "balanced diet",
        "B": "peer pressure",
        "C": "anxiety",
        "D": "priority"
      },
      "correct": "A",
      "vocab": "balanced diet",
      "explanation": "'balanced diet' là chế độ ăn uống cân bằng giàu rau củ và trái cây."
    },
    {
      "id": 23,
      "dialogue": [
        {
          "speaker": "Tom",
          "text": "How do you keep your body strong and healthy?"
        },
        {
          "speaker": "Jack",
          "text": "I play sports regularly to improve my _____"
        }
      ],
      "options": {
        "A": "mental health",
        "B": "anxiety",
        "C": "physical health",
        "D": "pressure"
      },
      "correct": "C",
      "vocab": "physical health",
      "explanation": "'physical health' là sức khỏe thể chất (chơi thể thao để cải thiện thể lực)."
    },
    {
      "id": 24,
      "dialogue": [
        {
          "speaker": "Lucy",
          "text": "You seem worried about the exam."
        },
        {
          "speaker": "Emma",
          "text": "Yes, I'm really _____ these days."
        }
      ],
      "options": {
        "A": "optimistic",
        "B": "balanced",
        "C": "anxious",
        "D": "prior"
      },
      "correct": "C",
      "vocab": "anxious",
      "explanation": "'anxious' đồng nghĩa với 'worried', nghĩa là lo lắng, bất an về kỳ thi."
    },
    {
      "id": 25,
      "dialogue": [
        {
          "speaker": "Ben",
          "text": "Why do you go jogging every morning?"
        },
        {
          "speaker": "Chris",
          "text": "I want to _____ and stay healthy."
        }
      ],
      "options": {
        "A": "stress out",
        "B": "keep fit",
        "C": "give up",
        "D": "cut down on"
      },
      "correct": "B",
      "vocab": "keep fit",
      "explanation": "'keep fit' là giữ dáng, giữ thể lực khỏe mạnh thông qua chạy bộ buổi sáng."
    },
    {
      "id": 26,
      "dialogue": [
        {
          "speaker": "Sophia",
          "text": "What do you usually do at the gym?"
        },
        {
          "speaker": "David",
          "text": "I often _____ for an hour after school."
        }
      ],
      "options": {
        "A": "work out",
        "B": "stay up late",
        "C": "stress out",
        "D": "give up"
      },
      "correct": "A",
      "vocab": "work out",
      "explanation": "'work out' là tập luyện thể hình, rèn luyện cơ bắp tại phòng gym."
    },
    {
      "id": 27,
      "dialogue": [
        {
          "speaker": "Mia",
          "text": "You shouldn't drink too much soda."
        },
        {
          "speaker": "Ryan",
          "text": "You're right. I need to _____ sugary drinks."
        }
      ],
      "options": {
        "A": "take up",
        "B": "cut down on",
        "C": "manage",
        "D": "keep fit"
      },
      "correct": "B",
      "vocab": "cut down on",
      "explanation": "'cut down on' nghĩa là cắt giảm đồ uống chứa nhiều đường."
    },
    {
      "id": 28,
      "dialogue": [
        {
          "speaker": "Olivia",
          "text": "Why did you start painting?"
        },
        {
          "speaker": "Noah",
          "text": "I decided to _____ a new hobby."
        }
      ],
      "options": {
        "A": "give up",
        "B": "stress out",
        "C": "take up",
        "D": "stay up"
      },
      "correct": "C",
      "vocab": "take up",
      "explanation": "'take up a hobby' là cụm từ quen thuộc mang nghĩa bắt đầu một sở thích mới."
    },
    {
      "id": 29,
      "dialogue": [
        {
          "speaker": "Kate",
          "text": "Teenagers often feel stressed because of _____ from friends."
        },
        {
          "speaker": "Brian",
          "text": "Yes, they want to fit in with others."
        }
      ],
      "options": {
        "A": "anxiety",
        "B": "priority",
        "C": "peer pressure",
        "D": "physical health"
      },
      "correct": "C",
      "vocab": "peer pressure",
      "explanation": "'peer pressure' là áp lực bạn bè cùng trang lứa khi muốn hòa nhập với mọi người xung quanh."
    },
    {
      "id": 30,
      "dialogue": [
        {
          "speaker": "Helen",
          "text": "How can students avoid stress?"
        },
        {
          "speaker": "Sam",
          "text": "They should learn how to _____ effectively."
        }
      ],
      "options": {
        "A": "manage time",
        "B": "give up",
        "C": "cut down",
        "D": "keep pressure"
      },
      "correct": "A",
      "vocab": "manage time",
      "explanation": "'manage time' là kỹ năng quản lý thời gian giúp học sinh tránh rơi vào tình trạng quá tải và căng thẳng."
    },
    {
      "id": 31,
      "dialogue": [
        {
          "speaker": "Jenny",
          "text": "Even though life is difficult, my brother is always cheerful."
        },
        {
          "speaker": "Paul",
          "text": "He's really _____"
        }
      ],
      "options": {
        "A": "anxious",
        "B": "optimistic",
        "C": "prior",
        "D": "balanced"
      },
      "correct": "B",
      "vocab": "optimistic",
      "explanation": "'optimistic' nghĩa là lạc quan, tích cực (luôn vui vẻ ngay cả khi cuộc sống khó khăn)."
    },
    {
      "id": 32,
      "dialogue": [
        {
          "speaker": "Alice",
          "text": "Why are you seeing a counselor?"
        },
        {
          "speaker": "Nick",
          "text": "I want to improve my _____"
        }
      ],
      "options": {
        "A": "physical pressure",
        "B": "balanced diet",
        "C": "mental health",
        "D": "work out"
      },
      "correct": "C",
      "vocab": "mental health",
      "explanation": "'mental health' là sức khỏe tâm thần / tinh thần (gặp chuyên gia tâm lý tư vấn để cải thiện tinh thần)."
    },
    {
      "id": 33,
      "dialogue": [
        {
          "speaker": "Sarah",
          "text": "You should stop eating so much fast food."
        },
        {
          "speaker": "Kevin",
          "text": "Yes, I want my meals to be more _____"
        }
      ],
      "options": {
        "A": "well-balanced",
        "B": "anxious",
        "C": "prior",
        "D": "stressed"
      },
      "correct": "A",
      "vocab": "well-balanced",
      "explanation": "'well-balanced' nghĩa là đầy đủ và cân bằng dinh dưỡng trong bữa ăn."
    },
    {
      "id": 34,
      "dialogue": [
        {
          "speaker": "Lily",
          "text": "Did you continue playing online games all night?"
        },
        {
          "speaker": "Ethan",
          "text": "No, I decided to _____ them and focus on studying."
        }
      ],
      "options": {
        "A": "take up",
        "B": "work out",
        "C": "give up",
        "D": "stress out"
      },
      "correct": "C",
      "vocab": "give up",
      "explanation": "'give up' nghĩa là từ bỏ game để tập trung cho việc học."
    },
    {
      "id": 35,
      "dialogue": [
        {
          "speaker": "Grace",
          "text": "Why are many students feeling nervous before exams?"
        },
        {
          "speaker": "Henry",
          "text": "Because they have a lot of _____ about their results."
        }
      ],
      "options": {
        "A": "optimism",
        "B": "anxiety",
        "C": "balance",
        "D": "priority"
      },
      "correct": "B",
      "vocab": "anxiety",
      "explanation": "'anxiety' nghĩa là sự lo âu, căng thẳng về kết quả thi cử."
    },
    {
      "id": 36,
      "dialogue": [
        {
          "speaker": "Chloe",
          "text": "What should be your top _____ now?"
        },
        {
          "speaker": "Daniel",
          "text": "My health and studies are the most important things."
        }
      ],
      "options": {
        "A": "pressure",
        "B": "diet",
        "C": "priority",
        "D": "workout"
      },
      "correct": "C",
      "vocab": "priority",
      "explanation": "'priority' là sự ưu tiên (sức khỏe và học tập là những việc quan trọng nhất)."
    },
    {
      "id": 37,
      "dialogue": [
        {
          "speaker": "Isabella",
          "text": "You look exhausted today."
        },
        {
          "speaker": "Lucas",
          "text": "I was so stressed that I completely _____ last night."
        }
      ],
      "options": {
        "A": "cut down on",
        "B": "stressed out",
        "C": "took up",
        "D": "kept fit"
      },
      "correct": "B",
      "vocab": "stress out",
      "explanation": "'stressed out' là cảm giác căng thẳng, kiệt sức về mặt tinh thần."
    },
    {
      "id": 38,
      "dialogue": [
        {
          "speaker": "Hannah",
          "text": "Why do you meditate every evening?"
        },
        {
          "speaker": "Leo",
          "text": "It helps me relax and improve my _____"
        }
      ],
      "options": {
        "A": "peer pressure",
        "B": "balanced diet",
        "C": "mental health",
        "D": "priority"
      },
      "correct": "C",
      "vocab": "mental health",
      "explanation": "'mental health' là sức khỏe tâm lý, tinh thần được cải thiện thông qua thiền định mỗi tối."
    },
    {
      "id": 39,
      "dialogue": [
        {
          "speaker": "Megan",
          "text": "Which activity did your sister start recently?"
        },
        {
          "speaker": "Jason",
          "text": "She _____ yoga to stay healthy."
        }
      ],
      "options": {
        "A": "gave up",
        "B": "took up",
        "C": "stressed out",
        "D": "cut down on"
      },
      "correct": "B",
      "vocab": "take up",
      "explanation": "'took up' (quá khứ của take up) nghĩa là bắt đầu tập yoga để rèn luyện sức khỏe."
    },
    {
      "id": 40,
      "dialogue": [
        {
          "speaker": "Rachel",
          "text": "You shouldn't spend so much time online."
        },
        {
          "speaker": "Adam",
          "text": "I know. I'll _____ screen time from now on."
        }
      ],
      "options": {
        "A": "work out",
        "B": "stay up late",
        "C": "cut down on",
        "D": "keep fit"
      },
      "correct": "C",
      "vocab": "cut down on",
      "explanation": "'cut down on' nghĩa là cắt giảm thời gian nhìn màn hình điện tử (screen time)."
    }
  ],
  "classes": {
    "9.2C": {
      "name": "Lớp 9.2C",
      "total_students": 43,
      "students": [
        {
          "stt": 1,
          "code": "7924842717",
          "name": "Lý Đặng Hoài An",
          "dob": "22/12/2012",
          "gender": "Nam",
          "loginCode": "9201"
        },
        {
          "stt": 2,
          "code": "7924846627",
          "name": "Lê Hoàng Bảo Anh",
          "dob": "30/05/2012",
          "gender": "Nam",
          "loginCode": "9202"
        },
        {
          "stt": 3,
          "code": "7924854269",
          "name": "Võ Trâm Anh",
          "dob": "13/10/2012",
          "gender": "Nữ",
          "loginCode": "9203"
        },
        {
          "stt": 4,
          "code": "7924853707",
          "name": "Lê Gia Bảo",
          "dob": "08/01/2012",
          "gender": "Nam",
          "loginCode": "9204"
        },
        {
          "stt": 5,
          "code": "7924846637",
          "name": "Nguyễn Thị Ninh Chi",
          "dob": "03/09/2012",
          "gender": "Nữ",
          "loginCode": "9205"
        },
        {
          "stt": 6,
          "code": "7924849710",
          "name": "Hoàng Thị Phương Chi",
          "dob": "26/07/2012",
          "gender": "Nữ",
          "loginCode": "9206"
        },
        {
          "stt": 7,
          "code": "7924842978",
          "name": "Hứa Đỗ Thành Đạt",
          "dob": "24/02/2012",
          "gender": "Nam",
          "loginCode": "9207"
        },
        {
          "stt": 8,
          "code": "7924853816",
          "name": "Phan Minh Đạt",
          "dob": "11/01/2012",
          "gender": "Nam",
          "loginCode": "9208"
        },
        {
          "stt": 9,
          "code": "7924843789",
          "name": "Nguyễn Ngọc Châu Giang",
          "dob": "27/03/2012",
          "gender": "Nữ",
          "loginCode": "9209"
        },
        {
          "stt": 10,
          "code": "7924853802",
          "name": "Mai Lê Minh Hằng",
          "dob": "25/11/2012",
          "gender": "Nữ",
          "loginCode": "9210"
        },
        {
          "stt": 11,
          "code": "7924845293",
          "name": "Lê Ngọc Hồng",
          "dob": "09/05/2012",
          "gender": "Nữ",
          "loginCode": "9211"
        },
        {
          "stt": 12,
          "code": "7593331734",
          "name": "Đỗ Lê Trình Thanh Hợp",
          "dob": "27/11/2012",
          "gender": "Nữ",
          "loginCode": "9212"
        },
        {
          "stt": 13,
          "code": "7924845619",
          "name": "Lê Gia Huỳnh",
          "dob": "27/05/2012",
          "gender": "Nữ",
          "loginCode": "9213"
        },
        {
          "stt": 14,
          "code": "5267761037",
          "name": "Võ Bá Nguyên Lâm",
          "dob": "29/02/2012",
          "gender": "Nam",
          "loginCode": "9214"
        },
        {
          "stt": 15,
          "code": "7924842981",
          "name": "Đỗ Minh Lâm",
          "dob": "23/01/2012",
          "gender": "Nam",
          "loginCode": "9215"
        },
        {
          "stt": 16,
          "code": "7924844310",
          "name": "Phạm Thanh Liêm",
          "dob": "29/09/2012",
          "gender": "Nam",
          "loginCode": "9216"
        },
        {
          "stt": 17,
          "code": "7924845288",
          "name": "Vũ Ngọc Trúc Linh",
          "dob": "10/07/2012",
          "gender": "Nữ",
          "loginCode": "9217"
        },
        {
          "stt": 18,
          "code": "7924847946",
          "name": "Trần Công Minh",
          "dob": "16/06/2012",
          "gender": "Nam",
          "loginCode": "9218"
        },
        {
          "stt": 19,
          "code": "7924843833",
          "name": "Đỗ Lê Tuyết My",
          "dob": "21/11/2012",
          "gender": "Nữ",
          "loginCode": "9219"
        },
        {
          "stt": 20,
          "code": "7924848168",
          "name": "Nguyễn Ngọc Trà My",
          "dob": "05/08/2012",
          "gender": "Nữ",
          "loginCode": "9220"
        },
        {
          "stt": 21,
          "code": "7924844958",
          "name": "Huỳnh Kim Ngân",
          "dob": "15/03/2012",
          "gender": "Nữ",
          "loginCode": "9221"
        },
        {
          "stt": 22,
          "code": "7924845322",
          "name": "Trần Lê Huỳnh Ngân",
          "dob": "23/05/2012",
          "gender": "Nữ",
          "loginCode": "9222"
        },
        {
          "stt": 23,
          "code": "7924848161",
          "name": "Quách Xuân Nghi",
          "dob": "15/06/2012",
          "gender": "Nữ",
          "loginCode": "9223"
        },
        {
          "stt": 24,
          "code": "7924845916",
          "name": "Nguyễn Trọng Nhân",
          "dob": "13/06/2012",
          "gender": "Nam",
          "loginCode": "9224"
        },
        {
          "stt": 25,
          "code": "7924848818",
          "name": "Bùi Minh Nhật",
          "dob": "12/10/2012",
          "gender": "Nam",
          "loginCode": "9225"
        },
        {
          "stt": 26,
          "code": "7924845625",
          "name": "Phạm Ngọc Yến Nhi",
          "dob": "21/12/2012",
          "gender": "Nữ",
          "loginCode": "9226"
        },
        {
          "stt": 27,
          "code": "7924846087",
          "name": "Nguyễn Thị Quỳnh Nhi",
          "dob": "19/06/2012",
          "gender": "Nữ",
          "loginCode": "9227"
        },
        {
          "stt": 28,
          "code": "7924849171",
          "name": "Nguyễn Yến Nhi",
          "dob": "09/08/2012",
          "gender": "Nữ",
          "loginCode": "9228"
        },
        {
          "stt": 29,
          "code": "7924847101",
          "name": "Vương San San",
          "dob": "05/06/2012",
          "gender": "Nữ",
          "loginCode": "9229"
        },
        {
          "stt": 30,
          "code": "7924850587",
          "name": "Phạm Nguyễn Tuấn Tài",
          "dob": "02/12/2012",
          "gender": "Nam",
          "loginCode": "9230"
        },
        {
          "stt": 31,
          "code": "7924852418",
          "name": "Hoàng Lê Thanh Thanh",
          "dob": "25/12/2012",
          "gender": "Nữ",
          "loginCode": "9231"
        },
        {
          "stt": 32,
          "code": "7924847117",
          "name": "Phan Đức Thắng",
          "dob": "14/08/2012",
          "gender": "Nam",
          "loginCode": "9232"
        },
        {
          "stt": 33,
          "code": "7924848448",
          "name": "Nguyễn Chí Thiện",
          "dob": "13/12/2012",
          "gender": "Nam",
          "loginCode": "9233"
        },
        {
          "stt": 34,
          "code": "7924848828",
          "name": "Nguyễn Đình Thụy",
          "dob": "21/04/2012",
          "gender": "Nam",
          "loginCode": "9234"
        },
        {
          "stt": 35,
          "code": "7924849177",
          "name": "Bùi Mai Anh Thư",
          "dob": "29/02/2012",
          "gender": "Nữ",
          "loginCode": "9235"
        },
        {
          "stt": 36,
          "code": "7924849460",
          "name": "Nguyễn Thị Anh Thư",
          "dob": "24/11/2012",
          "gender": "Nữ",
          "loginCode": "9236"
        },
        {
          "stt": 37,
          "code": "7924849865",
          "name": "Chung Kiều Tiên",
          "dob": "17/09/2012",
          "gender": "Nữ",
          "loginCode": "9237"
        },
        {
          "stt": 38,
          "code": "7924852701",
          "name": "Nguyễn Văn Toàn",
          "dob": "02/08/2012",
          "gender": "Nam",
          "loginCode": "9238"
        },
        {
          "stt": 39,
          "code": "7924849181",
          "name": "Tạ Nguyễn Bảo Trâm",
          "dob": "31/12/2012",
          "gender": "Nữ",
          "loginCode": "9239"
        },
        {
          "stt": 40,
          "code": "7924850645",
          "name": "Nguyễn Thị Thanh Tuyền",
          "dob": "18/10/2012",
          "gender": "Nữ",
          "loginCode": "9240"
        },
        {
          "stt": 41,
          "code": "7776024642",
          "name": "Võ Quang Vinh",
          "dob": "06/01/2012",
          "gender": "Nam",
          "loginCode": "9241"
        },
        {
          "stt": 42,
          "code": "7924852018",
          "name": "Nguyễn Hoàng Hải Yến",
          "dob": "01/06/2012",
          "gender": "Nữ",
          "loginCode": "9242"
        },
        {
          "stt": 43,
          "code": "7952844286",
          "name": "Lê Ngọc Như Yến",
          "dob": "23/12/2012",
          "gender": "Nữ",
          "loginCode": "9243"
        }
      ]
    },
    "9.5C": {
      "name": "Lớp 9.5C",
      "total_students": 29,
      "students": [
        {
          "stt": 1,
          "code": "7924846696",
          "name": "Nguyễn Hoàng An",
          "dob": "03/06/2012",
          "gender": "Nữ",
          "loginCode": "9501"
        },
        {
          "stt": 2,
          "code": "7924849683",
          "name": "Nguyễn Lê Duy Anh",
          "dob": "06/07/2012",
          "gender": "Nam",
          "loginCode": "9502"
        },
        {
          "stt": 3,
          "code": "7935612515",
          "name": "Võ Thái Quỳnh Anh",
          "dob": "10/11/2012",
          "gender": "Nữ",
          "loginCode": "9503"
        },
        {
          "stt": 4,
          "code": "7924854618",
          "name": "Chế Gia Bảo",
          "dob": "21/02/2012",
          "gender": "Nam",
          "loginCode": "9504"
        },
        {
          "stt": 5,
          "code": "7924846685",
          "name": "Lê Bùi Thanh Bình",
          "dob": "23/10/2012",
          "gender": "Nam",
          "loginCode": "9505"
        },
        {
          "stt": 6,
          "code": "7924854676",
          "name": "Nguyễn Ngọc Hân",
          "dob": "22/10/2012",
          "gender": "Nữ",
          "loginCode": "9506"
        },
        {
          "stt": 7,
          "code": "7924854625",
          "name": "Thạch Minh Huy",
          "dob": "03/01/2012",
          "gender": "Nam",
          "loginCode": "9507"
        },
        {
          "stt": 8,
          "code": "7924842965",
          "name": "Huỳnh Ngọc Khánh Huy",
          "dob": "20/02/2012",
          "gender": "Nam",
          "loginCode": "9508"
        },
        {
          "stt": 9,
          "code": "7924843357",
          "name": "Bùi Quốc Huy",
          "dob": "20/10/2012",
          "gender": "Nam",
          "loginCode": "9509"
        },
        {
          "stt": 10,
          "code": "7924843375",
          "name": "Bùi Ngọc Huyền",
          "dob": "16/08/2012",
          "gender": "Nữ",
          "loginCode": "9510"
        },
        {
          "stt": 11,
          "code": "7924843449",
          "name": "Hoàng Phương Linh",
          "dob": "26/11/2012",
          "gender": "Nữ",
          "loginCode": "9511"
        },
        {
          "stt": 12,
          "code": "7924844965",
          "name": "Hồ Thị Thúy Nga",
          "dob": "11/07/2012",
          "gender": "Nữ",
          "loginCode": "9512"
        },
        {
          "stt": 13,
          "code": "7924843801",
          "name": "Bùi Ngọc Kiều Ngân",
          "dob": "20/04/2012",
          "gender": "Nữ",
          "loginCode": "9513"
        },
        {
          "stt": 14,
          "code": "7924844396",
          "name": "Đỗ Nguyễn Kim Ngân",
          "dob": "20/08/2012",
          "gender": "Nữ",
          "loginCode": "9514"
        },
        {
          "stt": 15,
          "code": "8624846074",
          "name": "Nguyễn Đinh Uyển Nhi",
          "dob": "09/05/2012",
          "gender": "Nữ",
          "loginCode": "9515"
        },
        {
          "stt": 16,
          "code": "7924846070",
          "name": "Phạm Nguyễn Tấn Phát",
          "dob": "21/10/2012",
          "gender": "Nam",
          "loginCode": "9516"
        },
        {
          "stt": 17,
          "code": "7924846879",
          "name": "Phạm Trần Anh Phú",
          "dob": "20/07/2012",
          "gender": "Nam",
          "loginCode": "9517"
        },
        {
          "stt": 18,
          "code": "7924846386",
          "name": "Nguyễn Đình Phúc",
          "dob": "25/08/2012",
          "gender": "Nam",
          "loginCode": "9518"
        },
        {
          "stt": 19,
          "code": "7924847128",
          "name": "Nguyễn Ngọc Quyên",
          "dob": "14/07/2012",
          "gender": "Nữ",
          "loginCode": "9519"
        },
        {
          "stt": 20,
          "code": "7924847635",
          "name": "Nguyễn Chí Thạch",
          "dob": "30/04/2012",
          "gender": "Nam",
          "loginCode": "9520"
        },
        {
          "stt": 21,
          "code": "7924848472",
          "name": "Trương Hoài Thọ",
          "dob": "09/03/2012",
          "gender": "Nam",
          "loginCode": "9521"
        },
        {
          "stt": 22,
          "code": "7924848838",
          "name": "Huỳnh Ngọc Bảo Trâm",
          "dob": "21/02/2012",
          "gender": "Nữ",
          "loginCode": "9522"
        },
        {
          "stt": 23,
          "code": "7924849478",
          "name": "Nguyễn Ngọc Trọng",
          "dob": "15/02/2012",
          "gender": "Nam",
          "loginCode": "9523"
        },
        {
          "stt": 24,
          "code": "7910820496",
          "name": "Phạm Thanh Tuấn",
          "dob": "14/06/2011",
          "gender": "Nam",
          "loginCode": "9524"
        },
        {
          "stt": 25,
          "code": "7951509914",
          "name": "Trần Quốc Tỷ",
          "dob": "22/04/2012",
          "gender": "Nam",
          "loginCode": "9525"
        },
        {
          "stt": 26,
          "code": "7924851379",
          "name": "Võ Thái Kiều Vi",
          "dob": "24/01/2012",
          "gender": "Nữ",
          "loginCode": "9526"
        },
        {
          "stt": 27,
          "code": "7924850657",
          "name": "Nguyễn Thanh Vy",
          "dob": "05/07/2012",
          "gender": "Nữ",
          "loginCode": "9527"
        },
        {
          "stt": 28,
          "code": "7924851391",
          "name": "Đỗ Ngọc Như Ý",
          "dob": "19/08/2012",
          "gender": "Nữ",
          "loginCode": "9528"
        },
        {
          "stt": 29,
          "code": "7924853365",
          "name": "Nguyễn Ngọc Bảo Yến",
          "dob": "03/07/2012",
          "gender": "Nữ",
          "loginCode": "9529"
        }
      ]
    }
  }
};
