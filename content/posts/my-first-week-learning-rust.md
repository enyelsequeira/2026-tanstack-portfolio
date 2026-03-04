---
title: "My First Week Learning Rust Using The Book"
summary: "A frontend developer's journey into Rust, covering variables, types, functions, and control flow from The Rust Programming Language book."
date: "2021-11-22"
tags:
  - rust
  - programming
  - beginners
published: true
---

## Why Rust?
* As a Front-End developer, there is a lot you need to learn and keep up to date. One of the biggest changes coming to _web development_ is  **web3.0**, if you are not living under a rock you have probably heard about it,  at least a little. With these changes coming to the web I decided to learn **rust** to make myself more valuable, this decision also comes after researching the kind of projects you could do. One of them is a compiler, which funny enough my favorite **React** framework **Next** uses. I am a big fan of **Next** and my goal is to understand how **rust**  made a framework that was already fast even faster.


## My Plan
* Read [The Rust Programming Language](https://doc.rust-lang.org/book/)
* Try and read at least 1-2 hours each week
* Practice solving coding challenges with **rust**

## My First-week Impressions

* Coming from a **JavaScript** background, I had quite a few impressions. Most of them were good.
* To begin,  the first thing I noticed like most people, is that it is a static language, but what does that mean?. To put it simply, if you have been doing **JavaScript** for a while most likely you have started working with **TypeScript** and you noticed that you have to _type_ most of your code. **rust** is the same way.  You can either love this or hate it, for me I loved this, while I was trying some code it made me realize that you can code and deploy a lot faster if the language is _typed_ this also cause fewer mistakes when tracking errors and deploying code.
* My first week of learning **rust** I noticed how fast it is, I mean really fast. Creating a project was extremely fast taking less than 5s to get a project set up, granted it doesn't install any `dependencies` which I learned are called `crates` in **rust**.


## Things I have learned this week.
* By default when declaring a variable that becomes immutable, however, it is possible to make it mutable by adding the `mut` keyword like so `let mut number`
* You can also declare a variable using the `const` keyword, gotcha with this is that constants can not be assigned to a return value of a function.
* Declaring a function is similar to other languages you declare it using `fn` keyword and the entry point of any application is the `fn main(){...code}`
* The way printing to the terminal works is also different in **rust**. In  **JavaScript** we can interpolate, but in rust not yet, although it was mentioned that this is a feature that they want to add in the next release.
  * `let mut number: i32 = 50 `
  * `println!("number is {}", number);`
* This will print the number `50` to the terminal, it reads the variable after the comma.
* Semicolons are really important in **rust** it can be the difference between a statement and expression and yes they are different
  * a Statement is an action that does not return a value
  * Expression evaluates something and returns a value

* Types, in **rust** there are 2 data types subsets
  * Scalar
    * integers
      * just like numbers and we can use them signed and unsigned. If it needs a sign before the number, it should be typed using the signed _type_. This is used for negative numbers.
        ![Intergers chart](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/t70awn3jhj9102ij37h5.png)




		* floating-points
			* it has two types and the default is f64
				- f32 ==32bits==
				- f64 ==64bits==
		* Booleans
			* True/False
		* Characters
	* Compound
		* Tupples 
			* If you have done any **TypeScript** this works in a similar way
			* `let tup: (i32, f64, u8) = (500, 6,4, 1)`
			* We can destructure like `let (x, y, z) = tup;`
			* and get the values using indexes
		* Arrays
			* Arrays are a bit tricky at least to my understanding all of the _array_ items must be of the same type. They also have a fixed length and cannot add or remove. Instead, it was mentioned if I need to add or remove to use something like a **Vector** (still not sure what this is)
			* Accessing the element is the same way as it is in **JavaScript**
	- Maybe more, but still haven't learned about them. 

* Control flow works the same way as it does in any other language using `if` and `else if`
* You have 3 ways to loop (that I have read),
  * loop
  * while
  * for
* Functions can have an explicit return and with this, it does not matter where the function is declared, you can declare it at the end of the file and call it, in the beginning, this will still work. Being that is a _static typed_ language you need to type the parameters of a function.

![functions explicit](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/iprkupw65vb2414g5no7.png)

* Explicit return of the function `five`



![function semicolons](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ygyh41gwnya4cxatjdyu.png)
* In **rust** like mentioned above it is important the use of semicolons
  ![explicit](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/uvkmavx4cfrnwt4ti3wx.png)
  * this would not work because if we add a semicolon at the end of `x+1;` `fn plus_one` function this makes it into a statement and if you remember a statement does not have a return value.

## Conclusion
While I have learned a bit more than just these topics, I believe these are the key concepts of what I have learned this week.  I will continue to write what I have learned from the book each week and share it, if you want to follow you can follow my socials.

I am a beginner in the **rust** language so please keep in mind that the information given here is just my understanding and might not be the correct way. If you do see a typo or misinformation please do leave a comment. 😃

PS:  If you are interested in doing a Bootcamp,  I have partnered with Practicum By Yandex to offer a discount. This is one of the boot camps I did, and I really enjoyed the process. It offers a 30% discount which is pretty sweet considering most boot camps are expensive. 
