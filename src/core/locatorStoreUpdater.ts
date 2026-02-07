import * as ts from 'typescript';
import fs from 'fs';
import path from 'path';

export function updateLocatorStore(
  locatorKey: string,
  newSelector: string
) {
  const filePath = path.join(
    process.cwd(),
    'src',
    'core',
    'locatorStore.ts'
  );

  const sourceCode = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );

  const transformer = (context: ts.TransformationContext) => {
    const visit = (node: ts.Node): ts.Node => {
      // Look for: usernameInput: { ... }
      if (
        ts.isPropertyAssignment(node) &&
        ts.isIdentifier(node.name) &&
        node.name.text === locatorKey &&
        ts.isObjectLiteralExpression(node.initializer)
      ) {
        const updatedProps = node.initializer.properties.map((prop) => {
          if (
            ts.isPropertyAssignment(prop) &&
            ts.isIdentifier(prop.name) &&
            prop.name.text === 'primary'
          ) {
            return ts.factory.updatePropertyAssignment(
              prop,
              prop.name,
              ts.factory.createStringLiteral(newSelector)
            );
          }
          return prop;
        });

        return ts.factory.updatePropertyAssignment(
          node,
          node.name,
          ts.factory.updateObjectLiteralExpression(
            node.initializer,
            updatedProps
          )
        );
      }

      return ts.visitEachChild(node, visit, context);
    };

    return (node: ts.SourceFile) =>
      ts.visitNode(node, visit) as ts.SourceFile;

  };

  const result = ts.transform(sourceFile, [transformer]);
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const newContent = printer.printFile(result.transformed[0]);

  fs.writeFileSync(filePath, newContent, 'utf-8');

  console.log(
    `🛠️ Safely updated primary locator for "${locatorKey}" → ${newSelector}`
  );
}
