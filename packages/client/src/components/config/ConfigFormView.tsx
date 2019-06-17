import * as React from 'react';
import { Form } from 'react-bootstrap';
import './ConfigFormView.scss';
import ConfigureMetricModel from './ConfigureMetricModal';
import { CanaryMetricConfig } from '../../domain/CanaryConfigTypes';
import { connect, ConnectedComponent } from '../connectedComponent';
import ConfigEditorStore from '../../stores/ConfigEditorStore';
import { observer } from 'mobx-react';
import StackStore from '../../stores/StackStore';
import { boundMethod } from 'autobind-decorator';
import { ConfigFormButtonSection } from './ConfigFormButtonSection';
import { ScoringSection } from './ScoringSection';
import { NameAndDescriptionSection } from './NameAndDescriptionSection';
import { MetricsSection } from './MetricsSection';
import { KvMap } from '../../domain/CustomTypes';

interface Props {}
interface Stores {
  configEditorStore: ConfigEditorStore;
  modalStore: StackStore<JSX.Element>;
}

@connect(
  'configEditorStore',
  'modalStore'
)
@observer
export default class ConfigFormView extends ConnectedComponent<{}, Stores> {
  groupEdit: any;

  constructor(props: Props) {
    super(props);
    this.groupEdit = React.createRef();
  }

  @boundMethod
  updateConfigName(value: string): void {
    this.stores.configEditorStore.updateConfigName(value);
  }

  @boundMethod
  updateConfigDescription(value: string): void {
    this.stores.configEditorStore.updateConfigDescription(value);
  }

  @boundMethod
  updateSelectedGroup(group: string): void {
    this.stores.configEditorStore.updateSelectedGroup(group);
  }

  @boundMethod
  createNewGroup(): void {
    this.stores.configEditorStore.createNewGroup();
  }

  @boundMethod
  editCurrentGroup(): void {
    this.stores.configEditorStore.toggleEditCurrentGroup();
  }

  @boundMethod
  pushModal(modal: JSX.Element): void {
    this.stores.modalStore.push(modal);
  }

  @boundMethod
  popModal(): void {
    this.stores.modalStore.pop();
  }

  @boundMethod
  updateGroupName(currentGroupName: string, newGroupName: any): void {
    this.stores.configEditorStore.updateGroupName(currentGroupName, newGroupName);
  }

  @boundMethod
  updateGroupWeight(group: string, weight: number): void {
    this.stores.configEditorStore.updateGroupWeight(group, weight);
  }

  @boundMethod
  finishEditingCurrentGroup(): void {
    this.stores.configEditorStore.toggleEditCurrentGroup();
  }

  @boundMethod
  deleteGroup(group: string): void {
    this.stores.configEditorStore.removeSyntheticGroup(group);
  }

  @boundMethod
  editMetric(metric: CanaryMetricConfig, groups: string[]): void {
    this.stores.modalStore.push(
      <ConfigureMetricModel
        groups={groups}
        existingMetric={metric}
        cancel={this.stores.modalStore.pop}
        submit={(a, b) => {
          this.stores.configEditorStore.createOrUpdateMetric(a, b);
          this.stores.modalStore.pop();
        }}
      />
    );
  }

  @boundMethod
  createOrUpdateMetric(newMetric: CanaryMetricConfig, existingMetric: CanaryMetricConfig | undefined): void {
    this.stores.configEditorStore.createOrUpdateMetric(newMetric, existingMetric);
  }

  @boundMethod
  copyMetric(metricName: string): void {
    this.stores.configEditorStore.copyMetric(metricName);
  }

  @boundMethod
  deleteMetric(metricName: string): void {
    this.stores.configEditorStore.deleteMetric(metricName);
  }

  @boundMethod
  touch(id: string): void {
    this.stores.configEditorStore.touch(id);
  }

  @boundMethod
  markHasTheCopyOrSaveButtonBeenClickedFlagAsTrue(): void {
    this.stores.configEditorStore.markHasTheCopyOrSaveButtonBeenClickedFlagAsTrue();
  }

  render(): React.ReactNode {
    const {
      canaryConfigObject,
      syntheticGroups: groups,
      selectedGroup,
      isEditCurGroup,
      computedGroupWeights,
      errors,
      touched,
      hasTheCopyOrSaveButtonBeenClicked,
      isCanaryConfigValid
    } = this.stores.configEditorStore;

    return (
      <div id="canary-configuration-form-view">
        <Form>
          <NameAndDescriptionSection
            name={canaryConfigObject.name}
            description={canaryConfigObject.description}
            updateConfigName={this.updateConfigName}
            updateConfigDescription={this.updateConfigDescription}
            touch={this.touch}
            errors={errors}
            touched={touched}
            hasTheCopyOrSaveButtonBeenClicked={hasTheCopyOrSaveButtonBeenClicked}
          />
          <MetricsSection
            groups={groups}
            selectedGroup={selectedGroup}
            isEditCurGroup={isEditCurGroup}
            updateSelectedGroup={this.updateSelectedGroup}
            finishEditingCurrentGroup={this.finishEditingCurrentGroup}
            editCurrentGroup={this.editCurrentGroup}
            groupEdit={this.groupEdit}
            updateGroupName={this.updateGroupName}
            createNewGroup={this.createNewGroup}
            deleteGroup={this.deleteGroup}
            metrics={canaryConfigObject.metrics}
            editMetric={this.editMetric}
            copyMetric={this.copyMetric}
            deleteMetric={this.deleteMetric}
            pushModal={this.pushModal}
            popModal={this.popModal}
            createOrUpdateMetric={this.createOrUpdateMetric}
            errors={getMetricErrors(errors)}
            touched={touched['metrics'] || hasTheCopyOrSaveButtonBeenClicked}
          />
          <ScoringSection
            computedGroupWeights={computedGroupWeights}
            updateGroupWeight={this.updateGroupWeight}
            error={errors['classifier.groupWeights']}
            touched={touched['groupWeights'] || hasTheCopyOrSaveButtonBeenClicked}
          />
          <ConfigFormButtonSection
            canaryConfig={canaryConfigObject}
            hasTheCopyOrSaveButtonBeenClicked={hasTheCopyOrSaveButtonBeenClicked}
            isCanaryConfigValid={isCanaryConfigValid}
            markHasTheCopyOrSaveButtonBeenClickedFlagAsTrue={this.markHasTheCopyOrSaveButtonBeenClickedFlagAsTrue}
          />
        </Form>
      </div>
    );
  }
}

const getMetricErrors = (errors: KvMap<string>): string[] => {
  const metricErrors: string[] = [];
  Object.keys(errors)
    .filter(id => id.startsWith('metric'))
    .forEach(id => metricErrors.push(errors[id]));
  return metricErrors;
};