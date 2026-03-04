---
title: "Building a Data Table with Optimistic Updates"
summary: "How to build a polished data management system with TanStack Query optimistic updates, Mantine React Table, and smooth animations."
date: "2024-11-03"
tags:
  - javascript
  - webdev
  - programming
  - tutorial
published: true
---

## Introduction


## Introduction

Today, I'll share how I built a polished food database management system using modern React patterns. We'll focus on creating a responsive data table with seamless optimistic updates, combining the power of TanStack Query (formerly React Query) with Mantine's component library.

## Project Overview

### Requirements

- Display food items in a data table
- Add new items with immediate feedback
- Handle loading and error states gracefully
- Provide smooth optimistic updates

### Tech Stack

- **TanStack Query**: Server state management
- **Mantine UI**: Component library and form management
- **Mantine React Table**: Advanced table functionality
- **Wretch**: Clean API calls
- **TypeScript**: Type safety

## Implementation Guide

### 1. Setting Up the Foundation

First, let's define our types and API configuration:

```tsx
// Types
export type GetAllFoods = {
  id: number;
  name: string;
  category: string;
};

export type CreateNewFoodType = Pick<
  GetAllFoods,
  | 'name'
  | 'category'
>;

// API Configuration
export const API = wretch('<http://localhost:9999>').options({
  credentials: 'include',
  mode: 'cors',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// TANSTACK QUERY 
export const getFoodOptions = () => {
  return queryOptions({
    queryKey: ['all-foods'],
    queryFn: async () => {
      try {
        return await API.get('/foods')
          .unauthorized(() => {
            console.log('Unauthorized');
          })
          .json<Array<GetAllFoods>>();
      } catch (e) {
        console.log({ e });
        throw e;
      }
    },
  });
};

export const useGetAllFoods = () => {
  return useQuery({
    ...getFoodOptions(),
  });
};

```

### 2. Building the Data Table

The table component using Mantine React Table:

```tsx
const FoodsView = () => {
  const { data } = useGetAllFoods();

  const columns = useMemo<MRT_ColumnDef<GetAllFoods>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
      },
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'category',
        header: 'Category',
      },
      // ... other columns
    ],
    []
  );

  const table = useMantineReactTable({
    columns,
    data: data ?? [],
    // Optimistic update animation
    mantineTableBodyCellProps: ({ row }) => ({
      style: row.original.id < 0 ? {
        animation: 'shimmer-and-pulse 2s infinite',
        background: `linear-gradient(
          110deg,
          transparent 33%,
          rgba(83, 109, 254, 0.2) 50%,
          transparent 67%
        )`,
        backgroundSize: '200% 100%',
        position: 'relative',
      } : undefined,
    }),
  });

  return <MantineReactTable table={table} />;
};

```

### 3. Creating the Form

A form component for adding new foods:

```tsx
const CreateNewFood = () => {
  const { mutate } = useCreateNewFood();

  const formInputs = [
    { name: 'name', type: 'text' },
    { name: 'category', type: 'text' },
  ];

  const form = useForm<CreateNewFoodType>({
    initialValues: {
      name: '',
      category: '',
      // ... other fields
    },
  });

  return (
    <Box mt="md">
      <form onSubmit={form.onSubmit((data) => mutate(data))}>
        <Flex direction="column" gap="xs">
          {formInputs.map((input) => (
            <TextInput
              key={input.name}
              {...form.getInputProps(input.name)}
              label={input.name}
              tt="uppercase"
              type={input.type}
            />
          ))}
          <Button type="submit" mt="md">
            Create New
          </Button>
        </Flex>
      </form>
    </Box>
  );
};

```

### 4. Implementing Optimistic Updates

The heart of our implementation - TanStack Query mutation with optimistic updates:

```tsx
export const useCreateNewFood = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['create-new-food'],
    mutationFn: async (data: CreateNewFoodType) => {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Demo delay
      return API.url('/foods').post(data).json<GetAllFoods>();
    },
    onMutate: async (newFood) => {
      // Cancel in-flight queries
      await queryClient.cancelQueries({ queryKey: ['all-foods'] });

      // Snapshot current state
      const previousFoods = queryClient.getQueryData<GetAllFoods[]>(['all-foods']);

      // Create optimistic entry
      const optimisticFood: GetAllFoods = {
        id: -Math.random(),
        ...newFood,
        verified: false,
        createdBy: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Update cache optimistically
      queryClient.setQueryData(['all-foods'], (old) =>
        old ? [...old, optimisticFood] : [optimisticFood]
      );

      return { previousFoods };
    },
    onError: (err, _, context) => {
      // Rollback on error
      if (context?.previousFoods) {
        queryClient.setQueryData(['all-foods'], context.previousFoods);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['all-foods'] });
    },
  });
};

```

### 5. Animation Styles

The animation that brings our optimistic updates to life:

```css
@keyframes shimmer-and-pulse {
  0% {
    background-position: 200% 0;
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(83, 109, 254, 0.2);
  }
  50% {
    background-position: -200% 0;
    transform: scale(1.02);
    box-shadow: 0 0 0 10px rgba(83, 109, 254, 0);
  }
  100% {
    background-position: 200% 0;
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(83, 109, 254, 0);
  }
}

```

## Best Practices

1. **Optimistic Updates**
    - Immediately update UI for better UX
    - Handle error cases with rollbacks
    - Maintain data consistency with proper invalidation
2. **Type Safety**
    - Use TypeScript for better maintainability
    - Define clear interfaces for data structures
    - Leverage type inference where possible
3. **Performance**
    - Cancel in-flight queries during updates
    - Use proper query invalidation
    - Implement efficient form state management
4. **User Experience**
    - Provide immediate feedback
    - Show loading states
    - Handle errors gracefully

## Future Enhancements

Consider these improvements for your implementation:

- Undo/redo functionality
- Form validation rules
- Error boundary implementation

## Results

![enhanced](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/b3qlrg7srjc1bwx473q6.png)

Once Completed Request

![finished](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/uo2hlpa14ohpv6s7341c.png)




## Conclusion

This implementation demonstrates how to create a robust data management system using modern React patterns. The combination of TanStack Query, Mantine UI, and thoughtful optimistic updates creates a smooth and professional user experience.

Remember to:

- Keep your components focused and maintainable
- Handle all possible states (loading, error, success)
- Use TypeScript for better code quality
- Consider user experience in your implementation

[//]: # (---)

[//]: # (*What challenges have you faced implementing optimistic updates in your React applications? Share your experiences in the comments below.*)
