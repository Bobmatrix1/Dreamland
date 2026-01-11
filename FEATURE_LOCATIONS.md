# 📍 Dreamland - Where to Find Everything

## 🗺️ Visual Guide to All Features

### 🏠 Main Layout

```
┌─────────────────────────────────────────────────┐
│  [☰] Dreamland             [Install App] 📥     │  ← Top Bar
├──────────────┬──────────────────────────────────┤
│              │                                   │
│   SIDEBAR    │        MAIN CONTENT AREA         │
│              │                                   │
│  • Chat      │   ┌─ Chat List / Messages ───┐   │
│  • Storage   │   │  or Storage / Settings   │   │
│  • Settings  │   └──────────────────────────┘   │
│              │                                   │
│  ┌─────────┐│                                   │
│  │Quick    ││                                   │
│  │Features ││                                   │
│  └─────────┘│                                   │
│  [🌙] [🚪] │                                   │
└──────────────┴──────────────────────────────────┘
```

---

## 📱 Sidebar (Left Panel)

### Top Section
```
┌──────────────────┐
│ Dreamland   [X]  │ ← Title + Close (mobile)
├──────────────────┤
│ [👤] Demo User   │ ← Your Profile
│ demo@team...  🟢 │ ← Online Status
├──────────────────┤
│ ► Chat           │ ← Navigation
│   Storage        │
│   Settings       │
└──────────────────┘
```

### Bottom Section (Fun Features)
```
┌──────────────────┐
│ 📥 Install App   │ ← PWA Install (when available)
├──────────────────┤
│ Quick Features   │
│ ⚡ 🏆           │ ← 4 Fun Feature Buttons
│ 🎁 ✨           │
├──────────────────┤
│ [🌙] [🚪]       │ ← Theme Toggle | Logout
└──────────────────┘
```

**Location of Each:**
- `📥 Install App` - Top of bottom section (green button)
- `⚡ Quick Actions` - Top-left quad
- `🏆 Achievements` - Top-right quad  
- `🎁 Rewards` - Bottom-left quad
- `✨ AI Assistant` - Bottom-right quad
- `🌙 Theme` - Bottom left
- `🚪 Logout` - Bottom right

---

## 💬 Chat View Layout

### Chat List (Left Side)
```
┌────────────────────┐
│ Messages    [👥]   │ ← Header + Create Group Button
├────────────────────┤
│ [🔍] Search...     │ ← Search Input
├────────────────────┤
│ ┌───────────────┐  │
│ │[👤] Alex      │  │ ← Chat Item
│ │ Last message  │  │
│ │ 10:30    [2]  │  │ ← Time + Unread Badge
│ └───────────────┘  │
│ ┌───────────────┐  │
│ │[👥] Team      │  │ ← Group Chat
│ │ Group msg...  │  │
│ └───────────────┘  │
└────────────────────┘
```

**Features:**
- `👥 Create Group` - Top-right corner of chat list
- `🔍 Search` - Below header
- Click any chat to open it

### Chat Window (Right Side)
```
┌──────────────────────────────────────┐
│ [👤] Alex Johnson      [⋮]           │ ← Header
│ Online / 3 online • 5 members        │ ← Status
├──────────────────────────────────────┤
│                                      │
│  [👤] Hey! How are you?             │ ← Their Message
│      10:30                           │    (Colored Gradient)
│                                      │
│              [👤] Great! You? ☺️    │ ← Your Message  
│                            10:31    │    (Purple-Pink)
│                                      │
├──────────────────────────────────────┤
│ Replying to: "Hey..."         [X]   │ ← Reply Preview
├──────────────────────────────────────┤
│ [📎][😊] Type message... [🎤][📤]  │ ← Message Input
└──────────────────────────────────────┘
```

**Features:**
- `👤 Avatar` - Click to view profile
- `⋮ Three Dots` - Open dropdown menu
- `📎 Attach` - Attach files (left of input)
- `😊 Emoji` - Quick emoji picker
- `🎤 Microphone` - Record voice message
- `📤 Send` - Send message

### Message Actions (Hover)
```
┌────────────────────────────┐
│ [👤] Message text          │
│      [😊][↩️][📋][🗑️]    │ ← Action Icons
│      10:30                 │
└────────────────────────────┘
```

**On Hover Over Any Message:**
- `😊 React` - Add emoji reaction
- `↩️ Reply` - Reply to this message
- `📋 Copy` - Copy message text
- `🗑️ Delete` - Delete (own messages only)

### Three-Dot Dropdown Menu
```
When you click [⋮]:

┌──────────────────────┐
│ 👥 View Members      │
│ 🎨 Customize Chat    │ ← Opens background picker
│ 🖼️ Media Gallery     │
│ 📌 Pinned Messages   │
│ 🔍 Search in Chat    │
│ 📥 Export Chat       │
└──────────────────────┘
```

---

## 🎨 Chat Customization Panel

**How to Access:**
Click `⋮` → "Customize Chat"

```
Appears on right side:

┌──────────────────┐
│ 🎨 Chat Background│
├──────────────────┤
│ ┌──┐ ┌──┐       │
│ │□ │ │□ │       │ ← Background Tiles
│ └──┘ └──┘       │    (6 total)
│ ┌──┐ ┌──┐       │
│ │□ │ │□ │       │
│ └──┘ └──┘       │
├──────────────────┤
│ [Close]          │
└──────────────────┘
```

**6 Backgrounds:**
1. Default (top-left)
2. Sunset (top-right)
3. Ocean (middle-left)
4. Forest (middle-right)
5. Galaxy (bottom-left)
6. Candy (bottom-right)

---

## 🎤 Voice Recording Modal

**How to Access:**
Click `🎤` in message input

```
┌────────────────────────────┐
│      🎙️ Recording         │
│       00:15                │ ← Timer
├────────────────────────────┤
│                            │
│  🌈🌈🌈🌈🌈🌈🌈🌈🌈🌈   │ ← Rainbow Wave
│  50 colored bars dancing   │
│                            │
├────────────────────────────┤
│  [X Cancel]   [📤 Send]   │ ← Actions
└────────────────────────────┘
```

**Visual:**
- 50 vertical bars
- Each bar is different rainbow color
- Height = your voice amplitude
- Updates in real-time

---

## 👤 Profile Modal

**How to Access:**
Click any user's avatar

```
┌────────────────────────┐
│ Profile          [X]   │
├────────────────────────┤
│      [👤]              │ ← Avatar
│    [📷] (edit mode)    │    Camera icon when editing
│   🟢 Online            │ ← Status
├────────────────────────┤
│ Demo User              │ ← Name
│ demo@dreamland.app     │ ← Email
│ Admin                  │ ← Role
│                        │
│ Bio text here...       │ ← Bio
├────────────────────────┤
│ [Edit Profile]         │ ← Edit Button (own profile only)
└────────────────────────┘
```

**In Edit Mode:**
```
┌────────────────────────┐
│ [👤 Name]              │ ← Input Fields
│ [Bio textarea...]      │
├────────────────────────┤
│ [Cancel]    [Save]     │ ← Actions
└────────────────────────┘
```

---

## 👥 Create Group Modal

**How to Access:**
Click `👥` icon in chat list header

```
┌─────────────────────────┐
│ Create Group      [X]   │
├─────────────────────────┤
│ [👥 Group Name]         │ ← Name Input
│ [🔍 Search users...]    │ ← Search Input
├─────────────────────────┤
│ ┌────────────────────┐  │
│ │[👤] Alex Johnson  │  │ ← User List
│ │ alex@team...    ☑ │  │    Checkmarks
│ └────────────────────┘  │
│ ┌────────────────────┐  │
│ │[👤] Sarah W.      │  │
│ │ sarah@team...   ☐ │  │
│ └────────────────────┘  │
├─────────────────────────┤
│ [Cancel]  [Create]      │ ← Actions
└─────────────────────────┘
```

**Selected users** have purple-pink gradient background

---

## 😊 Emoji Picker

**How to Access:**
Hover over message → Click `😊` icon

```
Appears near message:

┌──────────────────┐
│ ❤️ 😂 😮 😢 😡 │ ← 5 emojis per row
│ 👍 👎 🎉 🔥 💯 │    3 rows
│ ✨ 👏 🙌 💪 🤝 │    15 total
└──────────────────┘
```

**Click any emoji** to react to that message

---

## 📁 Storage View

```
┌─────────────────────────────────────┐
│ Storage                             │
├─────────────────────────────────────┤
│ [🔍 Search] [📁 New] [📤 Upload]  │ ← Actions
├─────────────────────────────────────┤
│ [#][≡]              125 files      │ ← View Toggle
├─────────────────────────────────────┤
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│ │□   │ │□   │ │□   │ │□   │      │ ← File Grid
│ │File│ │File│ │File│ │File│      │
│ └────┘ └────┘ └────┘ └────┘      │
└─────────────────────────────────────┘
```

**Features:**
- `#` - Grid view toggle
- `≡` - List view toggle
- `📁` - Create folder
- `📤` - Upload files
- Click file to preview/download

---

## ⚙️ Settings View

```
┌────────────────────────┐
│ Settings               │
├────────────────────────┤
│ ┌──────────────────┐   │
│ │ 👤 Profile       │   │ ← Sections
│ │ [Name input]     │   │    Expandable Cards
│ │ [Email input]    │   │
│ └──────────────────┘   │
│                        │
│ ┌──────────────────┐   │
│ │ 🔔 Notifications │   │
│ │ [Toggle]         │   │
│ └──────────────────┘   │
│                        │
│ [Cancel] [Save]        │
└────────────────────────┘
```

**5 Main Sections:**
1. 👤 Profile
2. 🔔 Notifications
3. 🔒 Security
4. 🎨 Appearance
5. 🌍 Language & Region

---

## 🎯 Quick Reference

### To Do This... | Go Here...
- **Send message** → Type in bottom input bar
- **Reply** → Hover message → Click ↩️
- **React** → Hover message → Click 😊 → Pick emoji
- **View profile** → Click any avatar
- **Edit profile** → Click your avatar → "Edit Profile"
- **Create group** → Chat list → Click 👥
- **Customize background** → Three dots ⋮ → "Customize Chat"
- **Record voice** → Click 🎤 in input bar
- **Install app** → Sidebar bottom → Green "Install App"
- **Change theme** → Sidebar bottom → 🌙 icon
- **Search chats** → Top of chat list → 🔍
- **Upload files** → Storage → 📤 Upload
- **Change settings** → Sidebar → Settings → Pick section
- **Fun features** → Sidebar bottom → ⚡🏆🎁✨
- **Logout** → Sidebar bottom → 🚪

---

## 📊 Feature Count by Location

- **Sidebar**: 10 features
- **Chat List**: 3 features
- **Chat Window**: 15+ features
- **Message Hover**: 4 actions
- **Three-Dot Menu**: 6 options
- **Profile Modal**: 5 fields
- **Group Creation**: Full workflow
- **Voice Recording**: Full interface
- **Storage**: 8 features
- **Settings**: 15+ options

**Total Interactive Elements: 70+**

---

Now you know exactly where to find everything! 🎯