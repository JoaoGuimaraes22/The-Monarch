// src/lib/novels/utils/order-management.ts
// Utilities for managing order sequences in drag-and-drop operations

import { prisma } from "@/lib/prisma";

/**
 * Reorder items when moving within the same container
 */
export async function reorderWithinContainer<
  T extends { id: string; order: number }
>(
  items: T[],
  draggedItem: T,
  newOrder: number,
  updateCallback: (id: string, order: number) => Promise<void>
): Promise<void> {
  const oldOrder = draggedItem.order;

  if (oldOrder === newOrder) {
    return; // No change needed
  }

  if (oldOrder < newOrder) {
    // Moving down: shift items between oldOrder+1 and newOrder down by 1
    const itemsToShift = items.filter(
      (item) => item.order > oldOrder && item.order <= newOrder
    );

    for (const item of itemsToShift) {
      await updateCallback(item.id, item.order - 1);
    }
  } else {
    // Moving up: shift items between newOrder and oldOrder-1 up by 1
    const itemsToShift = items.filter(
      (item) => item.order >= newOrder && item.order < oldOrder
    );

    for (const item of itemsToShift) {
      await updateCallback(item.id, item.order + 1);
    }
  }

  // Update the dragged item
  await updateCallback(draggedItem.id, newOrder);
}

/**
 * Close gaps in order sequence after deletion
 */
export async function closeOrderGaps<T extends { id: string; order: number }>(
  items: T[],
  deletedOrder: number,
  updateCallback: (id: string, order: number) => Promise<void>
): Promise<void> {
  const itemsToReorder = items
    .filter((item) => item.order > deletedOrder)
    .sort((a, b) => a.order - b.order);

  for (let i = 0; i < itemsToReorder.length; i++) {
    const newOrder = deletedOrder + i;
    await updateCallback(itemsToReorder[i].id, newOrder);
  }
}

/**
 * Make space in order sequence for insertion
 */
export async function makeOrderSpace<T extends { id: string; order: number }>(
  items: T[],
  insertAtOrder: number,
  updateCallback: (id: string, order: number) => Promise<void>
): Promise<void> {
  const itemsToShift = items
    .filter((item) => item.order >= insertAtOrder)
    .sort((a, b) => b.order - a.order); // Sort descending to avoid conflicts

  for (const item of itemsToShift) {
    await updateCallback(item.id, item.order + 1);
  }
}

/**
 * Get next available order number
 */
export function getNextOrder<T extends { order: number }>(items: T[]): number {
  if (items.length === 0) return 1;
  return Math.max(...items.map((item) => item.order)) + 1;
}

/**
 * Validate and fix order sequence
 */
export async function validateAndFixOrderSequence<
  T extends { id: string; order: number }
>(
  items: T[],
  updateCallback: (id: string, order: number) => Promise<void>
): Promise<{ fixed: number; issues: string[] }> {
  const issues: string[] = [];
  let fixedCount = 0;

  // Sort items by current order
  const sortedItems = [...items].sort((a, b) => a.order - b.order);

  // Check for duplicates and gaps
  const orders = sortedItems.map((item) => item.order);
  const uniqueOrders = new Set(orders);

  if (orders.length !== uniqueOrders.size) {
    issues.push("Duplicate order numbers found");
  }

  // Check for gaps or non-sequential ordering
  for (let i = 0; i < sortedItems.length; i++) {
    const expectedOrder = i + 1;
    const actualOrder = sortedItems[i].order;

    if (actualOrder !== expectedOrder) {
      if (actualOrder < expectedOrder) {
        issues.push(
          `Order ${actualOrder} is too low (expected ${expectedOrder})`
        );
      } else {
        issues.push(`Gap in order sequence at position ${expectedOrder}`);
      }

      // Fix the order
      await updateCallback(sortedItems[i].id, expectedOrder);
      fixedCount++;
    }
  }

  return { fixed: fixedCount, issues };
}

/**
 * Database-specific order update functions
 */
export const dbOrderUpdates = {
  /**
   * Update scene order
   */
  async updateSceneOrder(sceneId: string, newOrder: number): Promise<void> {
    await prisma.scene.update({
      where: { id: sceneId },
      data: { order: newOrder, updatedAt: new Date() },
    });
  },

  /**
   * Update chapter order
   */
  async updateChapterOrder(chapterId: string, newOrder: number): Promise<void> {
    await prisma.chapter.update({
      where: { id: chapterId },
      data: { order: newOrder, updatedAt: new Date() },
    });
  },

  /**
   * Update act order
   */
  async updateActOrder(actId: string, newOrder: number): Promise<void> {
    await prisma.act.update({
      where: { id: actId },
      data: { order: newOrder, updatedAt: new Date() },
    });
  },
};
