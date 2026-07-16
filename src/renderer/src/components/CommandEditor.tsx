import { useState } from 'react'
import type { EventCommand, NamedEntry, ProjectSnapshot } from '../../../shared/contracts'
import { formatEventCommand } from '../event-commands'
import type { Locale, MessageSet } from '../i18n'

type CommandType = keyof MessageSet['editor']['types']

interface CommandEditorProps {
  commands: EventCommand[]
  project: ProjectSnapshot
  locale: Locale
  text: MessageSet
  onChange: (commands: EventCommand[]) => void
}

const commandTypes: CommandType[] = [
  'text',
  'switch',
  'variable',
  'selfSwitch',
  'gold',
  'item',
  'weapon',
  'armor',
  'commonEvent',
  'wait',
  'transfer',
  'conditionSwitch',
  'conditionVariable',
  'conditionItem'
]

function optionsForType(type: CommandType, project: ProjectSnapshot): NamedEntry[] {
  if (type === 'switch' || type === 'conditionSwitch') return project.switches
  if (type === 'variable' || type === 'conditionVariable') return project.variables
  if (type === 'item' || type === 'conditionItem') return project.database.items
  if (type === 'weapon') return project.database.weapons
  if (type === 'armor') return project.database.armors
  if (type === 'commonEvent') return project.commonEvents
  if (type === 'transfer') return project.maps
  return []
}

function hasTarget(type: CommandType): boolean {
  return [
    'switch',
    'variable',
    'item',
    'weapon',
    'armor',
    'commonEvent',
    'transfer',
    'conditionSwitch',
    'conditionVariable',
    'conditionItem'
  ].includes(type)
}

function isConditional(type: CommandType): boolean {
  return type === 'conditionSwitch' || type === 'conditionVariable' || type === 'conditionItem'
}

export function CommandEditor({
  commands,
  project,
  locale,
  text,
  onChange
}: CommandEditorProps): React.JSX.Element {
  const [type, setType] = useState<CommandType>('text')
  const [insertAt, setInsertAt] = useState(commands.length)
  const [indent, setIndent] = useState(0)
  const [targetId, setTargetId] = useState(1)
  const [content, setContent] = useState('')
  const [operation, setOperation] = useState(0)
  const [numericValue, setNumericValue] = useState(1)
  const [secondaryValue, setSecondaryValue] = useState(0)
  const [enabled, setEnabled] = useState(true)
  const [selfSwitch, setSelfSwitch] = useState('A')
  const [comparison, setComparison] = useState(0)
  const targetOptions = optionsForType(type, project)
  const needsOperation = ['variable', 'gold', 'item', 'weapon', 'armor'].includes(type)
  const needsNumber =
    needsOperation || type === 'wait' || type === 'conditionVariable' || type === 'transfer'
  const needsState = type === 'switch' || type === 'selfSwitch' || type === 'conditionSwitch'
  const insertionPositions = commands
    .map((command, index) => ({ command, index }))
    .filter(({ command }) => ![401, 405, 408, 655].includes(command.code))

  function selectType(nextType: CommandType): void {
    setType(nextType)
    setTargetId(optionsForType(nextType, project)[0]?.id ?? 1)
    setOperation(nextType === 'variable' ? 0 : 1)
  }

  function buildCommands(): EventCommand[] {
    switch (type) {
      case 'text':
        return [
          { code: 101, indent, parameters: ['', 0, 0, 2] },
          ...content.split('\n').map((line) => ({ code: 401, indent, parameters: [line] }))
        ]
      case 'switch':
        return [{ code: 121, indent, parameters: [targetId, targetId, enabled ? 0 : 1] }]
      case 'variable':
        return [
          { code: 122, indent, parameters: [targetId, targetId, operation, 0, numericValue, 0] }
        ]
      case 'selfSwitch':
        return [{ code: 123, indent, parameters: [selfSwitch, enabled ? 0 : 1] }]
      case 'gold':
        return [{ code: 125, indent, parameters: [operation === 2 ? 1 : 0, 0, numericValue] }]
      case 'item':
      case 'weapon':
      case 'armor':
        return [
          {
            code: type === 'item' ? 126 : type === 'weapon' ? 127 : 128,
            indent,
            parameters: [targetId, operation === 2 ? 1 : 0, 0, numericValue]
          }
        ]
      case 'commonEvent':
        return [{ code: 117, indent, parameters: [targetId] }]
      case 'wait':
        return [{ code: 230, indent, parameters: [numericValue] }]
      case 'transfer':
        return [
          {
            code: 201,
            indent,
            parameters: [0, targetId, numericValue, secondaryValue, 2, 0]
          }
        ]
      case 'conditionSwitch':
        return [
          { code: 111, indent, parameters: [0, targetId, enabled ? 0 : 1] },
          { code: 412, indent, parameters: [] }
        ]
      case 'conditionVariable':
        return [
          { code: 111, indent, parameters: [1, targetId, 0, numericValue, comparison] },
          { code: 412, indent, parameters: [] }
        ]
      case 'conditionItem':
        return [
          { code: 111, indent, parameters: [8, targetId] },
          { code: 412, indent, parameters: [] }
        ]
    }
  }

  function addCommand(): void {
    if (type === 'text' && content.length === 0) return
    if (hasTarget(type) && targetOptions.length === 0) return
    const position = Math.min(insertAt, commands.length)
    const additions = buildCommands()
    onChange([...commands.slice(0, position), ...additions, ...commands.slice(position)])
    if (isConditional(type)) {
      setInsertAt(position + 1)
      setIndent(Math.min(indent + 1, 100))
    } else {
      setInsertAt(position + additions.length)
    }
    if (type === 'text') setContent('')
  }

  function deleteCommand(index: number): void {
    const command = commands[index]
    let end = index + 1
    const continuationCode =
      command.code === 101
        ? 401
        : command.code === 105
          ? 405
          : command.code === 108
            ? 408
            : command.code === 355
              ? 655
              : 0
    if (continuationCode) {
      while (commands[end]?.code === continuationCode) end += 1
    } else if (command.code === 111) {
      const branchEnd = commands.findIndex(
        (candidate, candidateIndex) =>
          candidateIndex > index && candidate.code === 412 && candidate.indent === command.indent
      )
      if (branchEnd >= 0) end = branchEnd + 1
    }
    onChange([...commands.slice(0, index), ...commands.slice(end)])
    setInsertAt((current) => Math.min(current, commands.length - (end - index)))
  }

  return (
    <section className="command-editor">
      <div className="editor-grid command-builder">
        <label>
          <span>{text.editor.commandType}</span>
          <select value={type} onChange={(event) => selectType(event.target.value as CommandType)}>
            {commandTypes.map((commandType) => (
              <option key={commandType} value={commandType}>
                {text.editor.types[commandType]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{text.editor.insertAt}</span>
          <select
            value={Math.min(insertAt, commands.length)}
            onChange={(event) => setInsertAt(Number(event.target.value))}
          >
            {insertionPositions.map(({ index }) => (
              <option key={index} value={index}>
                {text.editor.beforeCommand.replace('{id}', String(index + 1))}
              </option>
            ))}
            <option value={commands.length}>{text.editor.endPosition}</option>
          </select>
        </label>
        <label>
          <span>{text.editor.indent}</span>
          <input
            type="number"
            min="0"
            max="100"
            value={indent}
            onChange={(event) => setIndent(Number(event.target.value))}
          />
        </label>

        {type === 'text' && (
          <label className="wide-field">
            <span>{text.editor.content}</span>
            <textarea value={content} onChange={(event) => setContent(event.target.value)} />
          </label>
        )}

        {hasTarget(type) && (
          <label>
            <span>{type === 'transfer' ? text.maps.map : text.editor.target}</span>
            <select value={targetId} onChange={(event) => setTargetId(Number(event.target.value))}>
              {targetOptions.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  #{entry.id} {entry.name || text.unnamed}
                </option>
              ))}
            </select>
          </label>
        )}

        {needsState && type !== 'selfSwitch' && (
          <label>
            <span>{text.editor.state}</span>
            <select
              value={enabled ? 'on' : 'off'}
              onChange={(event) => setEnabled(event.target.value === 'on')}
            >
              <option value="on">{text.editor.on}</option>
              <option value="off">{text.editor.off}</option>
            </select>
          </label>
        )}

        {type === 'selfSwitch' && (
          <>
            <label>
              <span>{text.editor.selfSwitch}</span>
              <select value={selfSwitch} onChange={(event) => setSelfSwitch(event.target.value)}>
                {['A', 'B', 'C', 'D'].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
            <label>
              <span>{text.editor.state}</span>
              <select
                value={enabled ? 'on' : 'off'}
                onChange={(event) => setEnabled(event.target.value === 'on')}
              >
                <option value="on">{text.editor.on}</option>
                <option value="off">{text.editor.off}</option>
              </select>
            </label>
          </>
        )}

        {needsOperation && (
          <label>
            <span>{text.editor.operation}</span>
            <select
              value={operation}
              onChange={(event) => setOperation(Number(event.target.value))}
            >
              {type === 'variable' && <option value="0">{text.editor.set}</option>}
              <option value="1">{text.editor.add}</option>
              <option value="2">{text.editor.subtract}</option>
            </select>
          </label>
        )}

        {needsNumber && (
          <label>
            <span>
              {type === 'wait'
                ? text.editor.frames
                : type === 'transfer'
                  ? text.editor.destinationX
                  : needsOperation
                    ? text.editor.amount
                    : text.editor.value}
            </span>
            <input
              type="number"
              min={type === 'variable' || type === 'conditionVariable' ? undefined : 0}
              value={numericValue}
              onChange={(event) => setNumericValue(Number(event.target.value))}
            />
          </label>
        )}

        {type === 'transfer' && (
          <label>
            <span>{text.editor.destinationY}</span>
            <input
              type="number"
              min="0"
              value={secondaryValue}
              onChange={(event) => setSecondaryValue(Number(event.target.value))}
            />
          </label>
        )}

        {type === 'conditionVariable' && (
          <label>
            <span>{text.editor.comparison}</span>
            <select
              value={comparison}
              onChange={(event) => setComparison(Number(event.target.value))}
            >
              <option value="0">{text.editor.equal}</option>
              <option value="1">{text.editor.greaterEqual}</option>
              <option value="2">{text.editor.lessEqual}</option>
              <option value="3">{text.editor.greater}</option>
              <option value="4">{text.editor.less}</option>
              <option value="5">{text.editor.notEqual}</option>
            </select>
          </label>
        )}
      </div>

      <button
        type="button"
        className="secondary-button editor-add-button"
        onClick={addCommand}
        disabled={
          (type === 'text' && content.length === 0) ||
          (hasTarget(type) && targetOptions.length === 0)
        }
      >
        {text.editor.addCommand}
      </button>

      {commands.length === 0 ? (
        <p className="empty-state compact">{text.noData}</p>
      ) : (
        <ol className="editable-command-list">
          {commands.map((command, index) => {
            const formatted = formatEventCommand(command, project, locale)
            return (
              <li key={`${index}-${command.code}`}>
                <span className="command-code">{command.code}</span>
                <div className="editable-command-content">
                  <strong>{formatted.name}</strong>
                  {formatted.detail && <p>{formatted.detail}</p>}
                </div>
                <div className="command-actions">
                  {![402, 403, 404, 411, 412, 413, 601, 602, 603, 604].includes(command.code) && (
                    <button
                      type="button"
                      title={text.editor.delete}
                      onClick={() => deleteCommand(index)}
                    >
                      ×
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
