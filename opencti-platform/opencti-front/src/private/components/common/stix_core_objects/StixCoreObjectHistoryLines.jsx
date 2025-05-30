import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose, pathOr } from 'ramda';
import withStyles from '@mui/styles/withStyles';
import { graphql, createRefetchContainer } from 'react-relay';
import Paper from '@mui/material/Paper';
import { interval } from 'rxjs';
import inject18n from '../../../../components/i18n';
import StixCoreObjectHistoryLine from './StixCoreObjectHistoryLine';
import { FIVE_SECONDS } from '../../../../utils/Time';

const interval$ = interval(FIVE_SECONDS);

const styles = () => ({
  paperHistory: {
    marginTop: 6,
    padding: 15,
    borderRadius: 4,
  },
  avatar: {
    width: 40,
    height: 40,
  },
});

class StixCoreObjectHistoryLinesComponent extends Component {
  componentDidMount() {
    this.subscription = interval$.subscribe(() => {
      this.props.relay.refetch();
    });
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render() {
    const { t, classes, data, isRelationLog } = this.props;
    const logs = pathOr([], ['logs', 'edges'], data);
    return (
      <Paper classes={{ root: classes.paperHistory }} className={'paper-for-grid'} variant="outlined">
        {logs.length > 0 ? (
          logs.map((logEdge) => {
            const log = logEdge.node;
            return (
              <StixCoreObjectHistoryLine
                key={log.id}
                node={log}
                isRelation={isRelationLog}
              />
            );
          })
        ) : (
          <div
            style={{
              display: 'table',
              height: '100%',
              width: '100%',
            }}
          >
            <span
              style={{
                display: 'table-cell',
                verticalAlign: 'middle',
                textAlign: 'center',
              }}
            >
              {isRelationLog
                ? t('No relations history about this entity.')
                : t('No history about this entity.')}
            </span>
          </div>
        )}
      </Paper>
    );
  }
}

StixCoreObjectHistoryLinesComponent.propTypes = {
  stixCoreObjectId: PropTypes.string,
  isRelationLog: PropTypes.bool,
  data: PropTypes.object,
  classes: PropTypes.object,
  t: PropTypes.func,
};

export const stixCoreObjectHistoryLinesQuery = graphql`
  query StixCoreObjectHistoryLinesQuery(
    $first: Int
    $orderBy: LogsOrdering
    $orderMode: OrderingMode
    $filters: FilterGroup
    $search: String
  ) {
    ...StixCoreObjectHistoryLines_data
  }
`;

const StixCoreObjectHistoryLines = createRefetchContainer(
  StixCoreObjectHistoryLinesComponent,
  {
    data: graphql`
      fragment StixCoreObjectHistoryLines_data on Query {
        logs(
          first: $first
          orderBy: $orderBy
          orderMode: $orderMode
          filters: $filters
          search: $search
        ) {
          edges {
            node {
              id
              ...StixCoreObjectHistoryLine_node
            }
          }
        }
      }
    `,
  },
  stixCoreObjectHistoryLinesQuery,
);

export default compose(
  inject18n,
  withStyles(styles),
)(StixCoreObjectHistoryLines);
