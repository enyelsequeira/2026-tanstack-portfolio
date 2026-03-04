---
title: "Using React Hook Form with Controller? No More"
summary: "A better approach to using React Hook Form with external UI libraries by leveraging the useController hook and TypeScript generics."
date: "2022-11-24"
tags:
  - react
  - webdev
  - javascript
  - typescript
published: true
---

## Introduction

React Hook Form is a popular library that simplifies the process of building forms in React. One of its key features is the use of "Controller" components, which provides a way to connect an external UI component such for example a component from `Material` `Mantine` or `Chakra ui`.

I absolutely love RHF and have made my job easier, however one thing that I really dislike is how sometimes it can be hard to make it work with other  components libraries (or maybe its just me).

I always struggle specially setting up `headless ui` tailwind and the main reason, is the way internals of the library behave. I will show a way to make it work nice and easily without any hassle or any bugs (at least I haven't found any yet) similar I will show you how you can remove the usage of `Controller` and use the hook with other component libraries

RHF definition of the hook is here h[ttps://react-hook-form.com/api/usecontroller](https://react-hook-form.com/api/usecontroller/) in short this hook allow us to do everything the `Controller` component does

## Let's look at a simple code

let's see how the `Controller` works in case you are not aware of it

```tsx

const {test} = useForm<YOURTYPE>()

<Controller
  control={test.control}
  name="endDate"
  render={({ field: { onChange } }) => (
    <DatePicker
      defaultValue={new Date()}
      classNames={{
        root: "w-72",
      }}
      onChange={(e) => onChange(e?.toString())}
      maxDate={new Date()}
      allowFreeInput
      label="To"
      placeholder="To"
      icon={<IconCalendar size={16} />}
    />
  )}
/>;
```

now the code above works just fine, this is the implementation if you are using `mantine` this is the component library we are using, what this is doing, is just passing the  `onChange` that we get from the `Controller` to the `DatePicker` and as expected we would get a value in string format

Imagine you will have to pick a date in different parts of your code sure you can keep adding a `controller`each time and yes it will work, instead what I propose is to use this as a starting point and make it better using `TS`and default props we get from both `RHF`and `mantine` let's see an alternative

```tsx
import type { FieldValues,  UseControllerProps} from "react-hook-form";
import { useController} from "react-hook-form";

export type OwnDatePickerProps<T extends FieldValues> =
  UseControllerProps<T> & Omit<DatePickerProps, "value" | "defaultValue">;

export function OwnDatePicker<T extends FieldValues>({
  name,
  control,
  defaultValue,
  rules,
  shouldUnregister,
  onChange,
  ...props
}: OwnDatePickerProps<T>) {
  const {
    field: { value, onChange: fieldOnChange, ...field },
    fieldState,
  } = useController<T>({
    name,
    control,
    defaultValue,
    rules,
    shouldUnregister,
  });

  return (
    <DatePicker
      defaultValue={new Date()}
      value={value}
      onChange={(e) => {
        fieldOnChange(e?.toString());
      }}
      error={fieldState.error?.message}
      {...field}
      {...props}
    />
  );
}
```

we create our own type using `TS`and omit certain values that we don't need or we don't want to control, and just let `RHF` do its thing, we use generics to achieve this, I am not a TS wizard, but this approach allow us to use the component without `Controller` like so

```tsx

const {test} = useForm<YOURTYPE>()

<>
....code
<OwnDatePicker
 name="endDate"
 control={test.control}
 maxDate={new Date()}
allowFreeInput
label="To"
placeholder="To"
 icon={<IconCalendar size={16} />}
classNames={{
   root: "w-72",
   }}
/>
.....
</>
```

and the beauty of this is that it is typesafe and if one props is not there `TS`will start complaining, avoiding errors

now let's look at another of my favorite which is `headless ui` I have a love/hate relationship when setting it up with `RHF` not anymore though found a good way to make it work, overwriting/omiting and using the `RHF` default to handle change state. Let's look at some code

```tsx
import { Listbox, Transition, ListboxProps } from "@headlessui/react";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";

export type OwnMultiSelectProps<
  T extends FieldValues,
  TTag extends ElementType = "div",
  TType = string,
  TActualType extends {} = Record<string, any>
> = UseControllerProps<T> &
  Omit<ListboxProps<TTag, TType, TActualType>, "value" | "defaultValue"> & {
    // OWN PROPS YOU WOULD LIKE
  };

// usage

export function OwnMultiSelect<
  T extends FieldValues,
  TTag extends ElementType = "div",
  TType = string,
  TActualType extends {} = Record<string, any>
>({
  name,
  control,
  defaultValue,
  rules,
  shouldUnregister,
  ...props
}: OwnMultiSelectProps<T, TTag, TType, TActualType>) {
  const {
    field: { value, onChange: fieldOnChange, ...field },
    fieldState,
  } = useController<T>({
    name,
    control,
    defaultValue,
    rules,
    shouldUnregister,
  });
  
  return (
    <div className="w-72">
      <Listbox
        value={selectedItems}
        onChange={(e) => fieldOnChange(e)}
        multiple
      >
        <div className="relative mt-1">
         // your code here
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            // your code here
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
```

and with this, you avoid workaround, like the ones I have found online, in here you allow `RHF` to handle most of the work, regarding the `TS` like I said I am not an expert, but this seems to work fine, without any complaints and you still get the goodies from `Listbox` props

## Conclusion

In conclusion, while React Hook Form is a great library for building forms in React, it can be challenging to use with other component libraries. The `Controller` component can help, but it can also be cumbersome to use repeatedly throughout your code. By creating your own components that utilize the `useController` hook and generic types, you can simplify the process and make it more typesafe. By doing so, you can take advantage of the features of other component libraries while still benefiting from the ease of use of React Hook Form.

as always if you find there is a mistake in the code please do share so it can be changed or improved upon. Thank you!
