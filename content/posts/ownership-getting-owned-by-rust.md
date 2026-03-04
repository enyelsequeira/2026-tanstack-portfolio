---
title: "Ownership? More Like Getting Owned by Rust"
summary: "Diving into Rust's ownership system, borrowing, and structs in week two of learning Rust - the hardest concepts so far."
date: "2021-11-29"
tags:
  - rust
  - programming
  - beginners
published: true
---
Unfortunately, my second week with **Rust** was a bit slow. From having work to having a task asked by a current customer to add to their site, I barely had any time to study. Although I am glad, this was the case. I will explain why.

## Thoughts on my second week

* The second week was hard. I had to learn about **ownership** and what the heck is that?
* **ownership** is not something that you can pick up quick; at least, I am still trying to understand how it works
* I learned a bit more about the **heap** and **stack** they are big in a language like **Rust**
* **structs** are not too bad if you have worked with **TypeScript** a few gotchas there though


## Ownership rules

There are three main rules when it comes to ownership:
-  each variable has an owner
- there can only be one owner at the time
- when the owner goes out of scope, the  value will be dropped

These sound simple enough doesn't it? reality? __It is not__
I will try to explain what **ownership** is, this is my second week, so I could be wrong when explaining this.

The first thing to note is why does **Rust** have this concept of ownership is because it has to deal with memory management, and unlike other languages, **Rust** does not have a garbage collection. This makes Rust faster than most languages.

Ownership means that a variable cannot be used by another expression or reassigned somewhere in your code.

![codeblock](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/z7bx7mlkwtwioh7a6der.png)

The example that we have is quite simple we declare a `variable_a,` then we try to assign `variable_b` the value of the variable; however, this does not work because if you remember, we can only have one owner, meaning this would give us an error.

Dealing with ownership is a difficult concept, and we have to understand the **Stack** and the **heap** in the heap. You can think where data that is not fixed on size is stored, whereas the **stack** data that is fixed on size is stored. These can be, for example, a **bool** variable, also stored in the stack, is much faster than the heap.

We can change **ownership** using **&** this allows the user to change ownership by burrowing the value of the variable like so

![ownership](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/i24d4w7ulozr1j859few.png)

This works because we are using the **&** to borrow the value. This will not give us an error. We can also use the **clone** method, which would create a new variable on the heap. However, cloning is expensive to do.

Now there is a lot more going on with ownership, and quite honestly, I am still learning about it; I will link a video that really helped me understand ownership a lot better
[video](https://www.youtube.com/watch?v=lQ7XF-6HYGc&ab_channel=DougMilford)

I've also learned about **structs**, and to me, they were pretty similar to **interfaces/types** on **TypeScript** to use a struct is quite simple; we do it like so

![structs](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/w92dfemg4jn2pvuxmxh4.png)

this is very similar to **TypeScript** to use it as well its pretty simple; our variable needs to have the values that are in our **struct**

![structs](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ctg6df656i98jhzrfugs.png)

If we need to change some value from it, remember that variables are immutable by default, so you need to add the **mut** keyword to it. We can also refer to the value from the previous variable using dot notation.

![dot notation](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/5e8b4jn46uprrd4npi5u.png)

or another way, if the values are the same in both, you can use the short syntax version **..** kind of like the **spread** operator in JavaScript

**Structs** can also have methods; methods are just like functions

the first parameter is **self** this means is an instance of the struct the method is being called on

![methods](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/zb36gvblbh21gj99nxbq.png)

**imp1** implements Rectangle, and we add an area fn
this area function takes a self parameter to refer to the rectangle struct,
we also use **&self** in the area function because we do not want to have ownership only borrow
this way, we can access the area function just like a regular object in Javascript

There is a lot more to these topics, but I will stop here. This is just a quick intro and what I think they are.

As mentioned in my previous post, I am a beginner in **Rust**, so if you see a mistake and want to correct me or inform me differently, please do so in the comments. It will be appreciated 😃

as always if you are interested in becoming a developer and looking for a good BootCamp, hit me up to get you a really good discount for Practicum by Yandex BootCamp
