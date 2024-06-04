import { TIsolate } from 'Isolate';
import { walk } from 'IsolateWalker';

type WalkedNode = TIsolate<{ id: string }>;

describe('walk', () => {
  let tree = {} as unknown as WalkedNode;
  beforeEach(() => {
    tree = {
      data: { id: '0' },
      children: [
        {
          data: { id: '0.0' },
          children: [
            { data: { id: '0.0.0' } },
            {
              data: { id: '0.0.1' },
              children: [
                { data: { id: '0.0.1.0' } },
                { data: { id: '0.0.1.1' } },
              ],
            },
            { data: { id: '0.0.2' } },
          ],
        },
        { data: { id: '0.1' } },
      ],
    } as unknown as WalkedNode;
  });

  it('Should walk through the tree except the root', () => {
    const visited: Set<string> = new Set();
    walk(tree, isolate => {
      visited.add(isolate.data.id);
    });

    expect(visited).toEqual(
      new Set(['0.0.0', '0.0.1.0', '0.0.1.1', '0.0.1', '0.0.2', '0.0', '0.1']),
    );
  });

  it("Should traverse the tree in a depth-first order, starting from the root's children", () => {
    const visited: string[] = [];
    walk(tree, isolate => {
      visited.push(isolate.data.id);
    });

    expect(visited).toEqual([
      '0.0.0',
      '0.0.1.0',
      '0.0.1.1',
      '0.0.1',
      '0.0.2',
      '0.0',
      '0.1',
    ]);
  });

  describe('Breakout', () => {
    it('Should stop the walk when breakout is called', () => {
      const visited: Array<string> = [];
      walk(tree, (isolate, breakout) => {
        visited.push(isolate.data.id);
        if (isolate.data.id === '0.0.1') {
          breakout();
        }
      });

      expect(visited).toEqual(['0.0.0', '0.0.1.0', '0.0.1.1', '0.0.1']);
    });
  });

  describe('VisitOnly', () => {
    it('Should only visit nodes that satisfy the predicate', () => {
      const visited: Array<string> = [];
      walk(
        tree,
        isolate => {
          visited.push(isolate.data.id);
        },
        isolate => isolate.data.id.endsWith('1'),
      );

      expect(visited).toEqual(['0.0.1.1', '0.0.1', '0.1']);
    });
  });
});
